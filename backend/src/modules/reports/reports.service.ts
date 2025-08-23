import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AttendanceDailyReport, CalculationStatus } from './entities/attendance-daily-report.entity';
import { AttendanceRecord, AttendanceResult, AttendanceType } from '../attendance/entities/attendance-record.entity';
import { Employee } from '../employees/entities/employee.entity';

export interface CalculateReportOptions {
  employeeId?: number;
  startDate?: Date;
  endDate?: Date;
  forceRecalculate?: boolean;
}

export interface DailyReportCalculationResult {
  employeeId: number;
  reportDate: Date;
  lateMinutes: number;
  overtimeHours: number;
  earlyLeaveMinutes: number;
  actualWorkingHours: number;
  businessTripHours: number;
  isAbsent: boolean;
  calculationStatus: CalculationStatus;
  calculationMessage?: string;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(AttendanceDailyReport)
    private readonly dailyReportRepository: Repository<AttendanceDailyReport>,
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRecordRepository: Repository<AttendanceRecord>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  /**
   * 计算指定条件下的考勤日报
   */
  async calculateDailyReports(options: CalculateReportOptions = {}): Promise<number> {
    const { employeeId, startDate, endDate, forceRecalculate = false } = options;
    
    let processedCount = 0;
    
    try {
      // 确定计算日期范围
      const defaultStartDate = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 默认7天前
      const defaultEndDate = endDate || new Date(); // 默认今天
      
      this.logger.log(`开始计算考勤日报: ${defaultStartDate.toDateString()} ~ ${defaultEndDate.toDateString()}`);
      
      // 获取需要计算的员工列表
      const employeeQuery = this.employeeRepository.createQueryBuilder('e')
        .where('e.status = :status', { status: 'active' });
      
      if (employeeId) {
        employeeQuery.andWhere('e.id = :employeeId', { employeeId });
      }
      
      const employees = await employeeQuery.getMany();
      
      if (employees.length === 0) {
        this.logger.warn('没有找到需要计算的员工');
        return 0;
      }
      
      // 按员工和日期循环计算
      for (const employee of employees) {
        const currentDate = new Date(defaultStartDate);
        
        while (currentDate <= defaultEndDate) {
          try {
            const result = await this.calculateEmployeeDailyReport(
              employee.id, 
              new Date(currentDate), 
              forceRecalculate
            );
            
            if (result) {
              await this.saveDailyReport(employee, result);
              processedCount++;
            }
          } catch (error) {
            this.logger.error(
              `计算员工 ${employee.name} (ID: ${employee.id}) 在 ${currentDate.toDateString()} 的日报失败:`, 
              error.stack
            );
            
            // 保存失败记录
            await this.saveDailyReport(employee, {
              employeeId: employee.id,
              reportDate: new Date(currentDate),
              lateMinutes: 0,
              overtimeHours: 0,
              earlyLeaveMinutes: 0,
              actualWorkingHours: 0,
              businessTripHours: 0,
              isAbsent: true,
              calculationStatus: CalculationStatus.FAILED,
              calculationMessage: error.message,
            });
          }
          
          // 移动到下一天
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      
      this.logger.log(`考勤日报计算完成，处理了 ${processedCount} 条记录`);
      return processedCount;
      
    } catch (error) {
      this.logger.error('考勤日报计算失败:', error.stack);
      throw error;
    }
  }

  /**
   * 计算单个员工某天的考勤日报
   */
  async calculateEmployeeDailyReport(
    employeeId: number,
    reportDate: Date,
    forceRecalculate = false
  ): Promise<DailyReportCalculationResult | null> {
    try {
      // 检查是否已经计算过且不强制重新计算
      if (!forceRecalculate) {
        const existing = await this.dailyReportRepository.findOne({
          where: { 
            employeeId, 
            reportDate,
            calculationStatus: CalculationStatus.SUCCESS 
          }
        });
        
        if (existing) {
          this.logger.debug(`员工 ${employeeId} 在 ${reportDate.toDateString()} 的日报已存在，跳过计算`);
          return null;
        }
      }
      
      // 获取当天的所有考勤记录
      const attendanceRecords = await this.attendanceRecordRepository.find({
        where: {
          employeeId,
          attendanceDate: reportDate
        },
        order: {
          attendanceTime: 'ASC',
          checkTime: 'ASC'
        }
      });
      
      // 计算各项指标
      const result = this.processAttendanceRecords(employeeId, reportDate, attendanceRecords);
      
      this.logger.debug(`员工 ${employeeId} 在 ${reportDate.toDateString()} 的日报计算完成`);
      return result;
      
    } catch (error) {
      this.logger.error(`计算员工 ${employeeId} 日报失败:`, error.stack);
      return {
        employeeId,
        reportDate,
        lateMinutes: 0,
        overtimeHours: 0,
        earlyLeaveMinutes: 0,
        actualWorkingHours: 0,
        businessTripHours: 0,
        isAbsent: true,
        calculationStatus: CalculationStatus.FAILED,
        calculationMessage: error.message,
      };
    }
  }

  /**
   * 处理考勤记录并计算各项指标
   */
  private processAttendanceRecords(
    employeeId: number,
    reportDate: Date,
    records: AttendanceRecord[]
  ): DailyReportCalculationResult {
    const result: DailyReportCalculationResult = {
      employeeId,
      reportDate,
      lateMinutes: 0,
      overtimeHours: 0,
      earlyLeaveMinutes: 0,
      actualWorkingHours: 0,
      businessTripHours: 0,
      isAbsent: false,
      calculationStatus: CalculationStatus.SUCCESS,
    };

    if (!records || records.length === 0) {
      result.isAbsent = true;
      result.calculationMessage = '当天无考勤记录';
      return result;
    }

    // 分离上班打卡和下班打卡
    const checkInRecords = records.filter(r => r.attendanceType === AttendanceType.CHECK_IN);
    const checkOutRecords = records.filter(r => r.attendanceType === AttendanceType.CHECK_OUT);
    
    // 计算迟到时长
    const lateRecords = checkInRecords.filter(r => r.result === AttendanceResult.LATE);
    result.lateMinutes = lateRecords.reduce((total, record) => {
      return total + this.calculateLateMinutes(record);
    }, 0);

    // 计算早退时长
    const earlyLeaveRecords = checkOutRecords.filter(r => r.result === AttendanceResult.EARLY_LEAVE);
    result.earlyLeaveMinutes = earlyLeaveRecords.reduce((total, record) => {
      return total + this.calculateEarlyLeaveMinutes(record);
    }, 0);

    // 计算加班时长
    const overtimeRecords = records.filter(r => r.result === AttendanceResult.OVERTIME);
    result.overtimeHours = overtimeRecords.reduce((total, record) => {
      return total + this.calculateOvertimeHours(record);
    }, 0);

    // 计算实际工作时长
    result.actualWorkingHours = this.calculateActualWorkingHours(checkInRecords, checkOutRecords);

    // 计算公出时长（基于备注或特殊标记）
    result.businessTripHours = this.calculateBusinessTripHours(records);

    // 检查缺勤状态
    const absentRecords = records.filter(r => r.result === AttendanceResult.ABSENT);
    result.isAbsent = absentRecords.length > 0 || (checkInRecords.length === 0 && checkOutRecords.length === 0);

    return result;
  }

  /**
   * 计算迟到分钟数
   */
  private calculateLateMinutes(record: AttendanceRecord): number {
    if (!record.checkTime) return 0;
    
    try {
      // 解析应打卡时间
      const [hours, minutes] = record.attendanceTime.split(':').map(Number);
      const scheduledTime = new Date(record.attendanceDate);
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      const actualTime = new Date(record.checkTime);
      const diffMs = actualTime.getTime() - scheduledTime.getTime();
      
      return Math.max(0, Math.floor(diffMs / (1000 * 60)));
    } catch (error) {
      this.logger.warn(`计算迟到时长失败: ${error.message}`);
      return 0;
    }
  }

  /**
   * 计算早退分钟数
   */
  private calculateEarlyLeaveMinutes(record: AttendanceRecord): number {
    if (!record.checkTime) return 0;
    
    try {
      const [hours, minutes] = record.attendanceTime.split(':').map(Number);
      const scheduledTime = new Date(record.attendanceDate);
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      const actualTime = new Date(record.checkTime);
      const diffMs = scheduledTime.getTime() - actualTime.getTime();
      
      return Math.max(0, Math.floor(diffMs / (1000 * 60)));
    } catch (error) {
      this.logger.warn(`计算早退时长失败: ${error.message}`);
      return 0;
    }
  }

  /**
   * 计算加班小时数
   */
  private calculateOvertimeHours(record: AttendanceRecord): number {
    // 这里需要根据业务规则来定义加班的计算逻辑
    // 暂时返回固定值，实际应该基于工作时间和打卡时间计算
    return 1; // 每条加班记录默认1小时，实际应该更精确
  }

  /**
   * 计算实际工作时长
   */
  private calculateActualWorkingHours(
    checkInRecords: AttendanceRecord[], 
    checkOutRecords: AttendanceRecord[]
  ): number {
    if (checkInRecords.length === 0 || checkOutRecords.length === 0) {
      return 0;
    }

    try {
      // 取最早的上班打卡和最晚的下班打卡
      const earliestCheckIn = checkInRecords.reduce((earliest, current) => {
        const currentTime = current.checkTime ? new Date(current.checkTime).getTime() : 0;
        const earliestTime = earliest.checkTime ? new Date(earliest.checkTime).getTime() : Infinity;
        return currentTime < earliestTime ? current : earliest;
      });

      const latestCheckOut = checkOutRecords.reduce((latest, current) => {
        const currentTime = current.checkTime ? new Date(current.checkTime).getTime() : 0;
        const latestTime = latest.checkTime ? new Date(latest.checkTime).getTime() : 0;
        return currentTime > latestTime ? current : latest;
      });

      if (!earliestCheckIn.checkTime || !latestCheckOut.checkTime) {
        return 0;
      }

      const diffMs = new Date(latestCheckOut.checkTime).getTime() - new Date(earliestCheckIn.checkTime).getTime();
      const hours = diffMs / (1000 * 60 * 60);
      
      // 减去午休时间（假设1小时）
      return Math.max(0, hours - 1);
    } catch (error) {
      this.logger.warn(`计算实际工作时长失败: ${error.message}`);
      return 0;
    }
  }

  /**
   * 计算公出时长
   */
  private calculateBusinessTripHours(records: AttendanceRecord[]): number {
    // 基于备注信息判断是否为公出
    const businessTripRecords = records.filter(record => 
      record.remark?.includes('公出') || 
      record.remark?.includes('外出') ||
      record.exceptionReason?.includes('公出')
    );
    
    // 简单计算：每条公出记录按4小时计算
    return businessTripRecords.length * 4;
  }

  /**
   * 保存日报数据
   */
  private async saveDailyReport(
    employee: Employee, 
    calculationResult: DailyReportCalculationResult
  ): Promise<AttendanceDailyReport> {
    // 查找现有记录
    let dailyReport = await this.dailyReportRepository.findOne({
      where: {
        employeeId: calculationResult.employeeId,
        reportDate: calculationResult.reportDate
      }
    });

    // 准备保存的数据
    const reportData = {
      employeeId: calculationResult.employeeId,
      reportDate: calculationResult.reportDate,
      employeeNo: employee.employeeNo,
      realName: employee.name,
      nickname: employee.name, // 暂时使用name作为nickname
      companyEmail: employee.email,
      primaryDepartment: '未分配', // 需要根据实际部门信息补充
      lateMinutes: calculationResult.lateMinutes,
      calculationMessage: calculationResult.calculationMessage,
      calculationStatus: calculationResult.calculationStatus,
      paternityLeaveWorkingDays: 0, // 需要根据请假记录计算
      shift: '标准班次', // 需要根据实际班次信息补充
      businessTripHours: calculationResult.businessTripHours,
      actualWorkingHours: calculationResult.actualWorkingHours,
      overtimeHours: calculationResult.overtimeHours,
      earlyLeaveMinutes: calculationResult.earlyLeaveMinutes,
      isAbsent: calculationResult.isAbsent,
      lastCalculatedAt: new Date(),
    };

    if (dailyReport) {
      // 更新现有记录
      Object.assign(dailyReport, reportData);
    } else {
      // 创建新记录
      dailyReport = this.dailyReportRepository.create(reportData);
    }

    return await this.dailyReportRepository.save(dailyReport);
  }

  /**
   * 定时任务：每天凌晨2点计算前一天的考勤日报
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduledDailyReportCalculation(): Promise<void> {
    this.logger.log('开始执行定时考勤日报计算任务');
    
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const processedCount = await this.calculateDailyReports({
        startDate: yesterday,
        endDate: yesterday,
        forceRecalculate: false
      });
      
      this.logger.log(`定时考勤日报计算任务完成，处理了 ${processedCount} 条记录`);
    } catch (error) {
      this.logger.error('定时考勤日报计算任务失败:', error.stack);
    }
  }

  /**
   * 获取考勤日报（支持查询条件）
   */
  async getDailyReports(options: {
    employeeId?: number;
    startDate?: Date;
    endDate?: Date;
    calculationStatus?: CalculationStatus;
    page?: number;
    pageSize?: number;
  }) {
    const { employeeId, startDate, endDate, calculationStatus, page = 1, pageSize = 20 } = options;
    
    const queryBuilder = this.dailyReportRepository.createQueryBuilder('dr')
      .leftJoinAndSelect('dr.employee', 'e')
      .orderBy('dr.reportDate', 'DESC')
      .addOrderBy('e.employeeNo', 'ASC');
    
    if (employeeId) {
      queryBuilder.andWhere('dr.employeeId = :employeeId', { employeeId });
    }
    
    if (startDate) {
      queryBuilder.andWhere('dr.reportDate >= :startDate', { startDate });
    }
    
    if (endDate) {
      queryBuilder.andWhere('dr.reportDate <= :endDate', { endDate });
    }
    
    if (calculationStatus) {
      queryBuilder.andWhere('dr.calculationStatus = :calculationStatus', { calculationStatus });
    }
    
    const total = await queryBuilder.getCount();
    const reports = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();
    
    return {
      data: reports,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 触发指定日期的考勤计算（供外部调用）
   */
  async triggerCalculationForDate(date: Date, employeeIds?: number[]): Promise<number> {
    this.logger.log(`手动触发 ${date.toDateString()} 的考勤日报计算`);
    
    const options: CalculateReportOptions = {
      startDate: date,
      endDate: date,
      forceRecalculate: true
    };
    
    if (employeeIds && employeeIds.length > 0) {
      let totalProcessed = 0;
      for (const employeeId of employeeIds) {
        const count = await this.calculateDailyReports({
          ...options,
          employeeId
        });
        totalProcessed += count;
      }
      return totalProcessed;
    } else {
      return await this.calculateDailyReports(options);
    }
  }
}
