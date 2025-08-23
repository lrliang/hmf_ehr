import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AttendanceDailyReport, CalculationStatus } from './entities/attendance-daily-report.entity';
import { AttendanceMonthlyReport, MonthlyReportStatus } from './entities/attendance-monthly-report.entity';
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
  
  // 打卡时间信息
  firstCheckIn?: Date;
  lastCheckOut?: Date;
  dailyAttendanceStatus?: string;
  
  // 假期和节假日
  legalHolidayDays: number;
  makeupCardCount: number;
  
  // 各种假期天数
  annualLeaveDays: number;
  personalLeaveDays: number;
  sickLeaveDays: number;
  bereavementLeaveDays: number;
  childcareLeaveDays: number;
  maternityLeaveWorkingDays: number;
  
  // 加班时间统计
  weekendOvertimeHours: number;
  legalHolidayOvertimeHours: number;
  
  // 其他统计字段
  lateMinutes: number;
  overtimeHours: number;
  earlyLeaveMinutes: number;
  actualWorkingHours: number;
  businessTripHours: number;
  paternityLeaveWorkingDays: number;
  
  // 状态信息
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
    @InjectRepository(AttendanceMonthlyReport)
    private readonly monthlyReportRepository: Repository<AttendanceMonthlyReport>,
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
              
              // 打卡时间信息 - 失败时设为空
              firstCheckIn: undefined,
              lastCheckOut: undefined,
              dailyAttendanceStatus: '计算失败',
              
              // 假期和节假日 - 默认值
              legalHolidayDays: 0,
              makeupCardCount: 0,
              
              // 各种假期天数 - 默认值
              annualLeaveDays: 0,
              personalLeaveDays: 0,
              sickLeaveDays: 0,
              bereavementLeaveDays: 0,
              childcareLeaveDays: 0,
              maternityLeaveWorkingDays: 0,
              
              // 加班时间统计 - 默认值
              weekendOvertimeHours: 0,
              legalHolidayOvertimeHours: 0,
              
              // 其他统计字段 - 默认值
              lateMinutes: 0,
              overtimeHours: 0,
              earlyLeaveMinutes: 0,
              actualWorkingHours: 0,
              businessTripHours: 0,
              paternityLeaveWorkingDays: 0,
              
              // 状态信息
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
      
      // 自动触发月报计算
      await this.triggerMonthlyReportCalculation(options);
      
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
        
        // 打卡时间信息 - 失败时设为空
        firstCheckIn: undefined,
        lastCheckOut: undefined,
        dailyAttendanceStatus: '计算失败',
        
        // 假期和节假日 - 默认值
        legalHolidayDays: 0,
        makeupCardCount: 0,
        
        // 各种假期天数 - 默认值
        annualLeaveDays: 0,
        personalLeaveDays: 0,
        sickLeaveDays: 0,
        bereavementLeaveDays: 0,
        childcareLeaveDays: 0,
        maternityLeaveWorkingDays: 0,
        
        // 加班时间统计 - 默认值
        weekendOvertimeHours: 0,
        legalHolidayOvertimeHours: 0,
        
        // 其他统计字段 - 默认值
        lateMinutes: 0,
        overtimeHours: 0,
        earlyLeaveMinutes: 0,
        actualWorkingHours: 0,
        businessTripHours: 0,
        paternityLeaveWorkingDays: 0,
        
        // 状态信息
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
      
      // 打卡时间信息 - 待计算
      firstCheckIn: undefined,
      lastCheckOut: undefined,
      dailyAttendanceStatus: undefined,
      
      // 假期和节假日 - 默认值
      legalHolidayDays: 0,
      makeupCardCount: 0,
      
      // 各种假期天数 - 默认值（暂时为0，需要后续与请假系统集成）
      annualLeaveDays: 0,
      personalLeaveDays: 0,
      sickLeaveDays: 0,
      bereavementLeaveDays: 0,
      childcareLeaveDays: 0,
      maternityLeaveWorkingDays: 0,
      
      // 加班时间统计
      weekendOvertimeHours: 0,
      legalHolidayOvertimeHours: 0,
      
      // 其他统计字段
      lateMinutes: 0,
      overtimeHours: 0,
      earlyLeaveMinutes: 0,
      actualWorkingHours: 0,
      businessTripHours: 0,
      paternityLeaveWorkingDays: 0,
      
      // 状态信息
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
    const allRecordsWithTime = records.filter(r => r.checkTime);
    
    // ============= 计算打卡时间信息 =============
    if (allRecordsWithTime.length > 0) {
      // 首打卡时间（最早的打卡记录）
      result.firstCheckIn = allRecordsWithTime
        .sort((a, b) => new Date(a.checkTime!).getTime() - new Date(b.checkTime!).getTime())[0]?.checkTime;
      
      // 末打卡时间（最晚的打卡记录）
      result.lastCheckOut = allRecordsWithTime
        .sort((a, b) => new Date(b.checkTime!).getTime() - new Date(a.checkTime!).getTime())[0]?.checkTime;
    }
    
    // 日出勤状态判断
    result.dailyAttendanceStatus = this.calculateDailyAttendanceStatus(records);
    
    // ============= 计算节假日和补卡信息 =============
    // 法定假日判断（基于日期，需要后续完善节假日判断逻辑）
    result.legalHolidayDays = this.isLegalHoliday(reportDate) ? 1 : 0;
    
    // 补卡次数（手动补签的记录数量）
    result.makeupCardCount = records.filter(r => r.isManual).length;
    
    // ============= 计算各种假期天数 =============
    // TODO: 需要与请假系统集成，目前设为0
    // 这些字段需要从leave模块获取数据
    result.annualLeaveDays = 0; // await this.getLeaveHours(employeeId, reportDate, 'annual');
    result.personalLeaveDays = 0; // await this.getLeaveHours(employeeId, reportDate, 'personal');
    result.sickLeaveDays = 0; // await this.getLeaveHours(employeeId, reportDate, 'sick');
    result.bereavementLeaveDays = 0; // await this.getLeaveHours(employeeId, reportDate, 'bereavement');
    result.childcareLeaveDays = 0; // await this.getLeaveHours(employeeId, reportDate, 'childcare');
    result.maternityLeaveWorkingDays = 0; // await this.getLeaveHours(employeeId, reportDate, 'maternity');
    
    // ============= 计算加班时间统计 =============
    const overtimeRecords = records.filter(r => r.result === AttendanceResult.OVERTIME);
    
    // 区分公休日加班和法定假日加班
    const isWeekend = this.isWeekend(reportDate);
    const isLegalHoliday = this.isLegalHoliday(reportDate);
    
    if (isLegalHoliday) {
      // 法定假日加班
      result.legalHolidayOvertimeHours = overtimeRecords.reduce((total, record) => {
        return total + this.calculateOvertimeHours(record);
      }, 0);
    } else if (isWeekend) {
      // 公休日加班
      result.weekendOvertimeHours = overtimeRecords.reduce((total, record) => {
        return total + this.calculateOvertimeHours(record);
      }, 0);
    } else {
      // 工作日加班
      result.overtimeHours = overtimeRecords.reduce((total, record) => {
        return total + this.calculateOvertimeHours(record);
      }, 0);
    }
    
    // ============= 计算其他统计字段 =============
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

    // 计算实际工作时长
    result.actualWorkingHours = this.calculateActualWorkingHours(checkInRecords, checkOutRecords);

    // 计算公出时长（基于备注或特殊标记）
    result.businessTripHours = this.calculateBusinessTripHours(records);

    // 陪产假工作日天数（暂时设为0，需要与请假系统集成）
    result.paternityLeaveWorkingDays = 0; // await this.getLeaveHours(employeeId, reportDate, 'paternity');

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
   * 计算日出勤状态
   */
  private calculateDailyAttendanceStatus(records: AttendanceRecord[]): string {
    if (!records || records.length === 0) {
      return '缺勤';
    }

    const hasLate = records.some(r => r.result === AttendanceResult.LATE);
    const hasEarlyLeave = records.some(r => r.result === AttendanceResult.EARLY_LEAVE);
    const hasAbsent = records.some(r => r.result === AttendanceResult.ABSENT);
    const hasOvertime = records.some(r => r.result === AttendanceResult.OVERTIME);

    if (hasAbsent) {
      return '缺勤';
    } else if (hasLate && hasEarlyLeave) {
      return '迟到早退';
    } else if (hasLate) {
      return '迟到';
    } else if (hasEarlyLeave) {
      return '早退';
    } else if (hasOvertime) {
      return '加班';
    } else {
      return '正常';
    }
  }

  /**
   * 判断是否为周末
   */
  private isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0为周日，6为周六
  }

  /**
   * 判断是否为法定假日
   * TODO: 需要完善法定假日数据库或配置
   */
  private isLegalHoliday(date: Date): boolean {
    // 简单的法定假日判断逻辑，后续需要完善
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    // 元旦
    if (month === 1 && day === 1) return true;
    
    // 劳动节
    if (month === 5 && (day >= 1 && day <= 3)) return true;
    
    // 国庆节
    if (month === 10 && (day >= 1 && day <= 7)) return true;
    
    // TODO: 添加更多法定假日判断，包括农历节日（春节、清明、端午、中秋等）
    // 建议后续从数据库或配置文件中读取法定假日数据
    
    return false;
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
      
      // 打卡时间信息
      firstCheckIn: calculationResult.firstCheckIn,
      lastCheckOut: calculationResult.lastCheckOut,
      dailyAttendanceStatus: calculationResult.dailyAttendanceStatus,
      
      // 假期和节假日
      legalHolidayDays: calculationResult.legalHolidayDays,
      makeupCardCount: calculationResult.makeupCardCount,
      
      // 各种假期天数
      annualLeaveDays: calculationResult.annualLeaveDays,
      personalLeaveDays: calculationResult.personalLeaveDays,
      sickLeaveDays: calculationResult.sickLeaveDays,
      bereavementLeaveDays: calculationResult.bereavementLeaveDays,
      childcareLeaveDays: calculationResult.childcareLeaveDays,
      maternityLeaveWorkingDays: calculationResult.maternityLeaveWorkingDays,
      
      // 加班时间统计
      weekendOvertimeHours: calculationResult.weekendOvertimeHours,
      legalHolidayOvertimeHours: calculationResult.legalHolidayOvertimeHours,
      
      // 其他统计字段
      lateMinutes: calculationResult.lateMinutes,
      overtimeHours: calculationResult.overtimeHours,
      earlyLeaveMinutes: calculationResult.earlyLeaveMinutes,
      actualWorkingHours: calculationResult.actualWorkingHours,
      businessTripHours: calculationResult.businessTripHours,
      paternityLeaveWorkingDays: calculationResult.paternityLeaveWorkingDays,
      
      // 状态和元信息
      isAbsent: calculationResult.isAbsent,
      calculationMessage: calculationResult.calculationMessage,
      calculationStatus: calculationResult.calculationStatus,
      shift: '标准班次', // 需要根据实际班次信息补充
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
   * 定时任务：每天凌晨2点计算前一天的考勤日报，并自动触发月报计算
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async scheduledDailyReportCalculation(): Promise<void> {
    this.logger.log('开始执行定时考勤日报计算任务（包含月报自动计算）');
    
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      // 计算日报，会自动触发相关月份的月报计算
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

  // ============= 月报计算相关方法 =============

  /**
   * 根据日报计算触发月报计算
   */
  private async triggerMonthlyReportCalculation(options: CalculateReportOptions): Promise<void> {
    try {
      this.logger.log('开始自动触发月报计算');

      // 获取涉及的月份
      const months = this.extractMonthsFromOptions(options);
      
      for (const month of months) {
        this.logger.log(`正在计算 ${month} 的月报`);
        
        if (options.employeeId) {
          // 单个员工
          await this.calculateEmployeeMonthlyReport(options.employeeId, month);
        } else {
          // 所有员工
          await this.calculateAllEmployeesMonthlyReport(month);
        }
      }
      
      this.logger.log(`月报计算完成，处理了 ${months.length} 个月份`);
    } catch (error) {
      this.logger.error('月报计算失败:', error.stack);
      // 月报计算失败不应该阻止日报计算的完成，所以这里只记录错误
    }
  }

  /**
   * 从选项中提取涉及的月份
   */
  private extractMonthsFromOptions(options: CalculateReportOptions): string[] {
    const months = new Set<string>();
    
    if (options.startDate && options.endDate) {
      const current = new Date(options.startDate);
      const end = new Date(options.endDate);
      
      while (current <= end) {
        const monthStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        months.add(monthStr);
        
        // 移动到下个月
        current.setMonth(current.getMonth() + 1);
        current.setDate(1); // 确保不会因为日期溢出而跳过月份
      }
    } else {
      // 如果没有指定日期范围，计算当前月份
      const now = new Date();
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthStr);
    }
    
    return Array.from(months);
  }

  /**
   * 计算单个员工某个月的月报
   */
  async calculateEmployeeMonthlyReport(employeeId: number, reportMonth: string): Promise<AttendanceMonthlyReport | null> {
    try {
      this.logger.debug(`开始计算员工 ${employeeId} 在 ${reportMonth} 的月报`);

      // 获取员工信息
      const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
      if (!employee) {
        this.logger.warn(`员工 ${employeeId} 不存在，跳过月报计算`);
        return null;
      }

      // 检查是否已存在月报记录
      const existingReport = await this.monthlyReportRepository.findOne({
        where: { employeeId, reportMonth }
      });

      // 如果已经是确认状态，跳过重新计算
      if (existingReport && existingReport.confirmationStatus === MonthlyReportStatus.CONFIRMED) {
        this.logger.debug(`员工 ${employee.name} 的 ${reportMonth} 月报已确认，跳过重新计算`);
        return existingReport;
      }

      // 获取该月的所有日报数据
      const [year, month] = reportMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1); // 月初
      const endDate = new Date(year, month, 0); // 月末

      const dailyReports = await this.dailyReportRepository.find({
        where: {
          employeeId,
          reportDate: Between(startDate, endDate)
        },
        order: { reportDate: 'ASC' }
      });

      // 计算月报数据
      const monthlyData = this.calculateMonthlyReportFromDailyReports(
        employee, reportMonth, dailyReports, startDate, endDate
      );

      // 保存月报
      const savedReport = await this.saveMonthlyReport(monthlyData, existingReport);
      
      this.logger.debug(`员工 ${employee.name} 的 ${reportMonth} 月报计算完成`);
      return savedReport;

    } catch (error) {
      this.logger.error(`计算员工 ${employeeId} 的 ${reportMonth} 月报失败:`, error.stack);
      return null;
    }
  }

  /**
   * 计算所有员工某个月的月报
   */
  async calculateAllEmployeesMonthlyReport(reportMonth: string): Promise<number> {
    let processedCount = 0;

    try {
      // 获取所有员工
      const employees = await this.employeeRepository.find();

      for (const employee of employees) {
        const result = await this.calculateEmployeeMonthlyReport(employee.id, reportMonth);
        if (result) {
          processedCount++;
        }
      }

      return processedCount;
    } catch (error) {
      this.logger.error(`计算所有员工 ${reportMonth} 月报失败:`, error.stack);
      throw error;
    }
  }

  /**
   * 从日报数据计算月报统计
   */
  private calculateMonthlyReportFromDailyReports(
    employee: Employee,
    reportMonth: string,
    dailyReports: AttendanceDailyReport[],
    startDate: Date,
    endDate: Date
  ): Partial<AttendanceMonthlyReport> {
    
    // 计算应出勤天数（排除周末和法定假日）
    const expectedWorkingDays = this.calculateExpectedWorkingDays(startDate, endDate);
    
    // 汇总统计
    const stats = {
      // 基础信息
      employeeId: employee.id,
      reportMonth,
      employeeNo: employee.employeeNo,
      realName: employee.name,
      nickname: employee.name,
      
      // 出勤统计
      expectedWorkingDays,
      actualWorkingDays: dailyReports.filter(r => !r.isAbsent).length,
      legalHolidayDays: dailyReports.reduce((sum, r) => sum + r.legalHolidayDays, 0),
      absentDays: dailyReports.filter(r => r.isAbsent).length,
      
      // 各种假期天数汇总
      personalLeaveDays: dailyReports.reduce((sum, r) => sum + r.personalLeaveDays, 0),
      annualLeaveDays: dailyReports.reduce((sum, r) => sum + r.annualLeaveDays, 0),
      compensatoryLeaveDays: 0, // 调休假暂时为0，需要后续完善
      sickLeaveDays: dailyReports.reduce((sum, r) => sum + r.sickLeaveDays, 0),
      breastfeedingLeaveDays: 0, // 哺乳假暂时为0，需要后续完善
      prenatalCheckupLeaveDays: 0, // 孕检假暂时为0，需要后续完善
      childcareLeaveDays: dailyReports.reduce((sum, r) => sum + r.childcareLeaveDays, 0),
      marriageLeaveDays: 0, // 婚假暂时为0，需要后续完善
      paternityLeaveDays: dailyReports.reduce((sum, r) => sum + r.paternityLeaveWorkingDays, 0),
      maternityLeaveDays: dailyReports.reduce((sum, r) => sum + r.maternityLeaveWorkingDays, 0),
      bereavementLeaveDays: dailyReports.reduce((sum, r) => sum + r.bereavementLeaveDays, 0),
      workInjuryLeaveDays: 0, // 工伤假暂时为0，需要后续完善
      homeVisitLeaveDays: 0, // 探亲假暂时为0，需要后续完善
      
      // 考勤时间统计
      totalLateMinutes: dailyReports.reduce((sum, r) => sum + r.lateMinutes, 0),
      totalEarlyLeaveMinutes: dailyReports.reduce((sum, r) => sum + r.earlyLeaveMinutes, 0),
      makeupCardCount: dailyReports.reduce((sum, r) => sum + r.makeupCardCount, 0),
      weekendOvertimeHours: dailyReports.reduce((sum, r) => sum + r.weekendOvertimeHours, 0),
      legalHolidayOvertimeHours: dailyReports.reduce((sum, r) => sum + r.legalHolidayOvertimeHours, 0),
      
      // 补贴信息（暂时为0，需要后续完善）
      businessTripNightAllowance: 0,
      workingDayDutyAllowance: 0,
      
      // 状态信息
      confirmationStatus: MonthlyReportStatus.DRAFT,
      lastCalculatedAt: new Date(),
      
      // 计算快照
      calculationSnapshot: {
        dailyReportCount: dailyReports.length,
        calculationDate: new Date(),
        dailyReportIds: dailyReports.map(r => r.id)
      }
    };
    
    return stats;
  }

  /**
   * 计算应出勤天数（排除周末和法定假日）
   */
  private calculateExpectedWorkingDays(startDate: Date, endDate: Date): number {
    let workingDays = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      // 排除周末和法定假日
      if (!this.isWeekend(current) && !this.isLegalHoliday(current)) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return workingDays;
  }

  /**
   * 保存月报数据
   */
  private async saveMonthlyReport(
    monthlyData: Partial<AttendanceMonthlyReport>,
    existingReport?: AttendanceMonthlyReport
  ): Promise<AttendanceMonthlyReport> {
    
    if (existingReport) {
      // 更新现有记录（保留确认状态相关字段）
      Object.assign(existingReport, {
        ...monthlyData,
        // 保留确认流程字段
        confirmationStatus: existingReport.confirmationStatus,
        confirmationInitiatedAt: existingReport.confirmationInitiatedAt,
        confirmationCompletedAt: existingReport.confirmationCompletedAt,
        confirmedBy: existingReport.confirmedBy,
        // 更新计算时间
        lastCalculatedAt: new Date()
      });
      
      return await this.monthlyReportRepository.save(existingReport);
    } else {
      // 创建新记录
      const newReport = this.monthlyReportRepository.create(monthlyData);
      return await this.monthlyReportRepository.save(newReport);
    }
  }

  // ============= 月报查询和管理相关方法 =============

  /**
   * 获取月报列表（支持查询条件）
   */
  async getMonthlyReports(options: {
    employeeId?: number;
    reportMonth?: string;
    confirmationStatus?: string;
    page?: number;
    pageSize?: number;
  }) {
    const {
      employeeId,
      reportMonth,
      confirmationStatus,
      page = 1,
      pageSize = 20
    } = options;

    // 构建查询条件
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (reportMonth) where.reportMonth = reportMonth;
    if (confirmationStatus) where.confirmationStatus = confirmationStatus;

    // 分页查询
    const [reports, total] = await this.monthlyReportRepository.findAndCount({
      where,
      relations: ['employee'],
      order: {
        reportMonth: 'DESC',
        employeeNo: 'ASC'
      },
      take: pageSize,
      skip: (page - 1) * pageSize
    });

    return {
      data: reports,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  }

  /**
   * 根据ID获取月报详情
   */
  async getMonthlyReportById(id: number): Promise<AttendanceMonthlyReport | null> {
    return await this.monthlyReportRepository.findOne({
      where: { id },
      relations: ['employee']
    });
  }

  /**
   * 确认月报
   */
  async confirmMonthlyReport(id: number, remark?: string): Promise<AttendanceMonthlyReport> {
    const report = await this.monthlyReportRepository.findOne({ where: { id } });
    
    if (!report) {
      throw new Error('月报不存在');
    }

    // 检查状态是否允许确认
    if (report.confirmationStatus === MonthlyReportStatus.CONFIRMED) {
      throw new Error('月报已确认，无法重复确认');
    }

    if (report.confirmationStatus === MonthlyReportStatus.LOCKED) {
      throw new Error('月报已锁定，无法确认');
    }

    // 更新确认状态
    report.confirmationStatus = MonthlyReportStatus.CONFIRMED;
    report.confirmationCompletedAt = new Date();
    report.confirmationInitiatedAt = report.confirmationInitiatedAt || new Date();
    
    if (remark) {
      report.remark = remark;
    }

    // TODO: 这里可以记录确认人信息
    // report.confirmedBy = currentUserId;

    return await this.monthlyReportRepository.save(report);
  }

  /**
   * 批量确认月报
   */
  async batchConfirmMonthlyReports(ids: number[], remark?: string): Promise<{
    successCount: number;
    failedCount: number;
    errors: string[];
  }> {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const id of ids) {
      try {
        await this.confirmMonthlyReport(id, remark);
        successCount++;
      } catch (error) {
        failedCount++;
        errors.push(`月报ID ${id}: ${error.message}`);
      }
    }

    return { successCount, failedCount, errors };
  }

  /**
   * 获取月报统计信息
   */
  async getMonthlyReportStats(reportMonth?: string) {
    const where: any = {};
    if (reportMonth) where.reportMonth = reportMonth;

    const [
      totalCount,
      draftCount,
      pendingCount,
      confirmedCount,
      rejectedCount,
      lockedCount
    ] = await Promise.all([
      this.monthlyReportRepository.count({ where }),
      this.monthlyReportRepository.count({ where: { ...where, confirmationStatus: MonthlyReportStatus.DRAFT } }),
      this.monthlyReportRepository.count({ where: { ...where, confirmationStatus: MonthlyReportStatus.PENDING } }),
      this.monthlyReportRepository.count({ where: { ...where, confirmationStatus: MonthlyReportStatus.CONFIRMED } }),
      this.monthlyReportRepository.count({ where: { ...where, confirmationStatus: MonthlyReportStatus.REJECTED } }),
      this.monthlyReportRepository.count({ where: { ...where, confirmationStatus: MonthlyReportStatus.LOCKED } })
    ]);

    return {
      total: totalCount,
      draft: draftCount,
      pending: pendingCount,
      confirmed: confirmedCount,
      rejected: rejectedCount,
      locked: lockedCount,
      confirmationRate: totalCount > 0 ? (confirmedCount / totalCount * 100).toFixed(2) : '0.00'
    };
  }
}
