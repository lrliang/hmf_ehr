import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { SalaryDetail, SalaryDetailStatus } from './entities/salary-detail.entity';
import { Employee } from '../employees/entities/employee.entity';
import { AttendanceMonthlyReport, MonthlyReportStatus } from '../reports/entities/attendance-monthly-report.entity';
import { 
  CreateSalaryDetailDto, 
  UpdateSalaryDetailDto, 
  QuerySalaryDetailDto,
  CalculateSalaryDto,
  BatchCalculateSalaryDto,
  SalaryCalculationResultDto,
  BatchSalaryCalculationResultDto
} from './dto';
import { PaginatedResult } from '@/common/dto/pagination.dto';

/**
 * 工资计算配置
 */
export interface SalaryCalculationConfig {
  /** 标准工时制月计薪天数 */
  standardPayDays: number; // 21.75天
  /** 标准每日工作小时 */
  standardDailyHours: number; // 8小时
  /** 休息日加班费率 */
  weekendOvertimeRate: number; // 200%
  /** 法定节假日加班费率 */
  holidayOvertimeRate: number; // 300%
  /** 平时延时加班费率 */
  dailyOvertimeRate: number; // 150%
  /** 单休制每周最大工作天数 */
  singleRestMaxDays: number; // 6天
  /** 单休制每周最大工作小时数 */
  singleRestMaxHours: number; // 44小时
  /** 双休制每周工作天数 */
  doubleRestDays: number; // 5天
  /** 双休制每周工作小时数 */
  doubleRestHours: number; // 40小时
  /** 每月最大加班小时数 */
  maxOvertimeHours: number; // 36小时
}

/**
 * 工资计算结果
 */
export interface SalaryCalculationDetail {
  /** 月标准工资 */
  baseSalary: number;
  /** 日工资 */
  dailyWage: number;
  /** 小时工资 */
  hourlyWage: number;
  /** 计薪天数 */
  payableDays: number;
  /** 应出勤天数 */
  expectedWorkingDays: number;
  /** 实出勤天数 */
  actualWorkingDays: number;
  /** 正常出勤工资 */
  normalAttendanceSalary: number;
  /** 事假扣款 */
  personalLeaveDeduction: number;
  /** 休息日加班费 */
  weekendOvertimePay: number;
  /** 法定节假日加班费 */
  holidayOvertimePay: number;
  /** 延时加班费 */
  dailyOvertimePay: number;
  /** 总加班费 */
  totalOvertimePay: number;
  /** 补助/奖金 */
  allowanceAndBonus: number;
  /** 考勤工资 */
  attendanceSalary: number;
  /** 应发工资 */
  grossSalary: number;
}

@Injectable()
export class SalaryService {
  private readonly logger = new Logger(SalaryService.name);
  private readonly config: SalaryCalculationConfig = {
    standardPayDays: 21.75,
    standardDailyHours: 8,
    weekendOvertimeRate: 2.0, // 200%
    holidayOvertimeRate: 3.0, // 300%
    dailyOvertimeRate: 1.5, // 150%
    singleRestMaxDays: 6,
    singleRestMaxHours: 44,
    doubleRestDays: 5,
    doubleRestHours: 40,
    maxOvertimeHours: 36
  };

  constructor(
    @InjectRepository(SalaryDetail)
    private readonly salaryDetailRepository: Repository<SalaryDetail>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(AttendanceMonthlyReport)
    private readonly monthlyReportRepository: Repository<AttendanceMonthlyReport>,
  ) {}

  /**
   * 创建工资详情
   */
  async create(createSalaryDetailDto: CreateSalaryDetailDto): Promise<SalaryDetail> {
    // 检查是否已存在相同员工和月份的记录
    const existing = await this.salaryDetailRepository.findOne({
      where: {
        employeeId: createSalaryDetailDto.employeeId,
        reportMonth: createSalaryDetailDto.reportMonth
      }
    });

    if (existing) {
      throw new ConflictException(`员工 ${createSalaryDetailDto.employeeNo} 的 ${createSalaryDetailDto.reportMonth} 工资详情已存在`);
    }

    const salaryDetail = this.salaryDetailRepository.create(createSalaryDetailDto);
    return this.salaryDetailRepository.save(salaryDetail);
  }

  /**
   * 查询工资详情列表
   */
  async findAll(queryDto: QuerySalaryDetailDto): Promise<PaginatedResult<SalaryDetail>> {
    const { 
      page, 
      limit, 
      employeeId, 
      employeeNo, 
      employeeName, 
      reportMonth, 
      status, 
      startMonth, 
      endMonth, 
      confirmedBy, 
      paidBy,
      sortBy,
      sortOrder 
    } = queryDto;

    const skip = (page - 1) * limit;
    const queryBuilder = this.salaryDetailRepository.createQueryBuilder('sd')
      .leftJoinAndSelect('sd.employee', 'employee')
      .leftJoinAndSelect('sd.attendanceMonthlyReport', 'report');

    // 添加查询条件
    if (employeeId) {
      queryBuilder.andWhere('sd.employeeId = :employeeId', { employeeId });
    }
    if (employeeNo) {
      queryBuilder.andWhere('sd.employeeNo LIKE :employeeNo', { employeeNo: `%${employeeNo}%` });
    }
    if (employeeName) {
      queryBuilder.andWhere('sd.employeeName LIKE :employeeName', { employeeName: `%${employeeName}%` });
    }
    if (reportMonth) {
      queryBuilder.andWhere('sd.reportMonth = :reportMonth', { reportMonth });
    }
    if (status && status.length > 0) {
      queryBuilder.andWhere('sd.status IN (:...status)', { status });
    }
    if (startMonth) {
      queryBuilder.andWhere('sd.reportMonth >= :startMonth', { startMonth });
    }
    if (endMonth) {
      queryBuilder.andWhere('sd.reportMonth <= :endMonth', { endMonth });
    }
    if (confirmedBy) {
      queryBuilder.andWhere('sd.confirmedBy = :confirmedBy', { confirmedBy });
    }
    if (paidBy) {
      queryBuilder.andWhere('sd.paidBy = :paidBy', { paidBy });
    }

    // 排序
    const orderBy = sortBy || 'reportMonth';
    const orderDirection = sortOrder || 'DESC';
    queryBuilder.orderBy(`sd.${orderBy}`, orderDirection);

    // 分页
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();
    return new PaginatedResult(items, total, page, limit);
  }

  /**
   * 查询单个工资详情
   */
  async findOne(id: number): Promise<SalaryDetail> {
    const salaryDetail = await this.salaryDetailRepository.findOne({
      where: { id },
      relations: ['employee', 'attendanceMonthlyReport']
    });

    if (!salaryDetail) {
      throw new NotFoundException(`工资详情 ID ${id} 不存在`);
    }

    return salaryDetail;
  }

  /**
   * 更新工资详情
   */
  async update(id: number, updateSalaryDetailDto: UpdateSalaryDetailDto): Promise<SalaryDetail> {
    const salaryDetail = await this.findOne(id);
    
    // 更新状态相关时间戳
    if (updateSalaryDetailDto.status) {
      if (updateSalaryDetailDto.status === SalaryDetailStatus.CONFIRMED) {
        salaryDetail.confirmedAt = new Date();
        if (updateSalaryDetailDto.confirmedBy) {
          salaryDetail.confirmedBy = updateSalaryDetailDto.confirmedBy;
        }
      } else if (updateSalaryDetailDto.status === SalaryDetailStatus.PAID) {
        salaryDetail.paidAt = new Date();
        if (updateSalaryDetailDto.paidBy) {
          salaryDetail.paidBy = updateSalaryDetailDto.paidBy;
        }
      }
    }

    Object.assign(salaryDetail, updateSalaryDetailDto);
    return this.salaryDetailRepository.save(salaryDetail);
  }

  /**
   * 删除工资详情
   */
  async remove(id: number): Promise<void> {
    const salaryDetail = await this.findOne(id);
    await this.salaryDetailRepository.softDelete(id);
  }

  /**
   * 计算指定月份员工工资
   */
  async calculateSalary(calculateDto: CalculateSalaryDto): Promise<BatchSalaryCalculationResultDto> {
    const { reportMonth, employeeIds, forceRecalculate } = calculateDto;
    
    this.logger.log(`开始计算 ${reportMonth} 工资，员工范围: ${employeeIds ? employeeIds.join(', ') : '全部'}`);

    const results: SalaryCalculationResultDto[] = [];
    let successCount = 0;
    let failureCount = 0;
    const errorSummary: string[] = [];

    try {
      // 获取需要计算的员工列表
      const employeeQuery = this.employeeRepository.createQueryBuilder('e')
        .where('e.status = :status', { status: 'active' });
      
      if (employeeIds && employeeIds.length > 0) {
        employeeQuery.andWhere('e.id IN (:...employeeIds)', { employeeIds });
      }

      const employees = await employeeQuery.getMany();

      if (employees.length === 0) {
        this.logger.warn('没有找到需要计算工资的员工');
        return {
          totalCount: 0,
          successCount: 0,
          failureCount: 0,
          results: [],
          errorSummary: ['没有找到需要计算工资的员工']
        };
      }

      // 批量处理每个员工的工资计算
      for (const employee of employees) {
        try {
          const result = await this.calculateEmployeeSalary(employee, reportMonth, forceRecalculate);
          results.push(result);
          
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
            if (result.error) {
              errorSummary.push(`${employee.employeeNo}: ${result.error}`);
            }
          }
        } catch (error) {
          failureCount++;
          const errorMsg = `员工 ${employee.employeeNo} 工资计算失败: ${error.message}`;
          this.logger.error(errorMsg, error.stack);
          
          results.push({
            employeeId: employee.id,
            employeeNo: employee.employeeNo,
            employeeName: employee.name,
            reportMonth,
            success: false,
            error: errorMsg
          });
          
          errorSummary.push(errorMsg);
        }
      }

      this.logger.log(`工资计算完成: 总计 ${results.length}，成功 ${successCount}，失败 ${failureCount}`);

      return {
        totalCount: results.length,
        successCount,
        failureCount,
        results,
        errorSummary: errorSummary.length > 0 ? errorSummary : undefined
      };

    } catch (error) {
      this.logger.error(`工资计算过程中发生错误: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 批量计算多个月份工资
   */
  async batchCalculateSalary(batchDto: BatchCalculateSalaryDto): Promise<BatchSalaryCalculationResultDto[]> {
    const { reportMonths, employeeIds, forceRecalculate } = batchDto;
    
    const batchResults: BatchSalaryCalculationResultDto[] = [];

    for (const reportMonth of reportMonths) {
      try {
        const result = await this.calculateSalary({
          reportMonth,
          employeeIds,
          forceRecalculate
        });
        batchResults.push(result);
      } catch (error) {
        this.logger.error(`批量计算 ${reportMonth} 工资失败: ${error.message}`, error.stack);
        batchResults.push({
          totalCount: 0,
          successCount: 0,
          failureCount: 1,
          results: [],
          errorSummary: [`${reportMonth}: ${error.message}`]
        });
      }
    }

    return batchResults;
  }

  /**
   * 计算单个员工工资
   */
  private async calculateEmployeeSalary(
    employee: Employee, 
    reportMonth: string, 
    forceRecalculate: boolean = false
  ): Promise<SalaryCalculationResultDto> {
    try {
      // 检查是否已存在工资记录
      const existingSalary = await this.salaryDetailRepository.findOne({
        where: { employeeId: employee.id, reportMonth }
      });

      if (existingSalary && !forceRecalculate) {
        return {
          employeeId: employee.id,
          employeeNo: employee.employeeNo,
          employeeName: employee.name,
          reportMonth,
          success: true,
          salaryDetailId: existingSalary.id
        };
      }

      // 获取员工月度考勤报告
      const monthlyReport = await this.monthlyReportRepository.findOne({
        where: { 
          employeeId: employee.id, 
          reportMonth,
          confirmationStatus: MonthlyReportStatus.CONFIRMED
        }
      });

      if (!monthlyReport) {
        return {
          employeeId: employee.id,
          employeeNo: employee.employeeNo,
          employeeName: employee.name,
          reportMonth,
          success: false,
          error: `缺少已确认的月度考勤报告`
        };
      }

      // 执行工资计算
      const calculationResult = await this.performSalaryCalculation(employee, monthlyReport);

      // 创建或更新工资详情记录
      const salaryDetailData = {
        employeeId: employee.id,
        attendanceMonthlyReportId: monthlyReport.id,
        reportMonth,
        employeeNo: employee.employeeNo,
        employeeName: employee.name,
        expectedWorkingDays: calculationResult.expectedWorkingDays,
        actualWorkingDays: calculationResult.actualWorkingDays,
        baseSalary: calculationResult.baseSalary,
        attendanceSalary: calculationResult.attendanceSalary,
        personalLeaveDeduction: calculationResult.personalLeaveDeduction,
        allowanceAndBonus: calculationResult.allowanceAndBonus,
        grossSalary: calculationResult.grossSalary,
        socialInsurance: 0, // 社保计算逻辑需要根据具体规则实现
        housingFund: 0, // 公积金计算逻辑需要根据具体规则实现
        incomeTax: 0, // 个税计算逻辑需要根据具体规则实现
        mealFee: 0, // 伙食费需要根据具体规则设置
        otherDeductions: 0,
        netSalary: calculationResult.grossSalary, // 简化处理，实际需要扣减社保、公积金、个税等
        status: SalaryDetailStatus.CALCULATED,
        calculatedAt: new Date(),
        calculationSnapshot: {
          calculation: calculationResult,
          employee: {
            id: employee.id,
            employeeNo: employee.employeeNo,
            name: employee.name,
            baseSalary: employee.baseSalary
          },
          monthlyReport: {
            id: monthlyReport.id,
            expectedWorkingDays: monthlyReport.expectedWorkingDays,
            actualWorkingDays: monthlyReport.actualWorkingDays,
            personalLeaveDays: monthlyReport.personalLeaveDays,
            weekendOvertimeHours: monthlyReport.weekendOvertimeHours,
            legalHolidayOvertimeHours: monthlyReport.legalHolidayOvertimeHours
          }
        }
      };

      let salaryDetail: SalaryDetail;
      if (existingSalary) {
        // 更新现有记录
        Object.assign(existingSalary, salaryDetailData);
        salaryDetail = await this.salaryDetailRepository.save(existingSalary);
      } else {
        // 创建新记录
        salaryDetail = this.salaryDetailRepository.create(salaryDetailData);
        salaryDetail = await this.salaryDetailRepository.save(salaryDetail);
      }

      return {
        employeeId: employee.id,
        employeeNo: employee.employeeNo,
        employeeName: employee.name,
        reportMonth,
        success: true,
        salaryDetailId: salaryDetail.id
      };

    } catch (error) {
      this.logger.error(`计算员工 ${employee.employeeNo} 工资失败: ${error.message}`, error.stack);
      return {
        employeeId: employee.id,
        employeeNo: employee.employeeNo,
        employeeName: employee.name,
        reportMonth,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 执行工资计算核心逻辑
   */
  private async performSalaryCalculation(
    employee: Employee, 
    monthlyReport: AttendanceMonthlyReport
  ): Promise<SalaryCalculationDetail> {
    const baseSalary = employee.baseSalary || 0;
    
    // 1. 计算日工资和小时工资
    const dailyWage = baseSalary / this.config.standardPayDays;
    const hourlyWage = dailyWage / this.config.standardDailyHours;

    // 2. 获取考勤数据
    const expectedWorkingDays = monthlyReport.expectedWorkingDays || 0;
    const actualWorkingDays = monthlyReport.actualWorkingDays || 0;
    const personalLeaveDays = monthlyReport.personalLeaveDays || 0;
    const weekendOvertimeHours = monthlyReport.weekendOvertimeHours || 0;
    const legalHolidayOvertimeHours = monthlyReport.legalHolidayOvertimeHours || 0;

    // 3. 计算正常出勤工资（按比例）
    const attendanceRatio = expectedWorkingDays > 0 ? actualWorkingDays / expectedWorkingDays : 0;
    const normalAttendanceSalary = baseSalary * attendanceRatio;

    // 4. 计算事假扣款
    const personalLeaveDeduction = dailyWage * personalLeaveDays;

    // 5. 计算加班费
    const weekendOvertimePay = dailyWage * this.config.weekendOvertimeRate * (weekendOvertimeHours / this.config.standardDailyHours);
    const holidayOvertimePay = dailyWage * this.config.holidayOvertimeRate * (legalHolidayOvertimeHours / this.config.standardDailyHours);
    
    // 延时加班费暂时为0，需要根据具体的工时数据计算
    const dailyOvertimePay = 0;
    const totalOvertimePay = weekendOvertimePay + holidayOvertimePay + dailyOvertimePay;

    // 6. 补助/奖金（从月度报告中获取）
    const allowanceAndBonus = (monthlyReport.businessTripNightAllowance || 0) + 
                            (monthlyReport.workingDayDutyAllowance || 0);

    // 7. 计算考勤工资 = 正常出勤工资 - 事假扣款 + 加班费
    const attendanceSalary = normalAttendanceSalary - personalLeaveDeduction + totalOvertimePay;

    // 8. 计算应发工资 = 考勤工资 + 补助/奖金
    const grossSalary = attendanceSalary + allowanceAndBonus;

    return {
      baseSalary,
      dailyWage,
      hourlyWage,
      payableDays: this.config.standardPayDays,
      expectedWorkingDays,
      actualWorkingDays,
      normalAttendanceSalary,
      personalLeaveDeduction,
      weekendOvertimePay,
      holidayOvertimePay,
      dailyOvertimePay,
      totalOvertimePay,
      allowanceAndBonus,
      attendanceSalary,
      grossSalary
    };
  }

  /**
   * 获取月份的日历天数
   */
  private getCalendarDaysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  /**
   * 计算月份的休息日天数（简化实现，实际应根据公司制度）
   */
  private getRestDaysInMonth(year: number, month: number, isDoubleRest: boolean = true): number {
    const daysInMonth = this.getCalendarDaysInMonth(year, month);
    let restDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay(); // 0 = 周日, 6 = 周六

      if (isDoubleRest) {
        // 双休制：周六周日都是休息日
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          restDays++;
        }
      } else {
        // 单休制：只有周日是休息日
        if (dayOfWeek === 0) {
          restDays++;
        }
      }
    }

    return restDays;
  }

  /**
   * 获取月份的法定节假日天数（简化实现，实际应查询节假日数据库）
   */
  private getLegalHolidayDaysInMonth(year: number, month: number): number {
    // 简化实现：根据月份返回常见节假日天数
    // 实际应该查询专门的法定节假日数据库
    const holidays = {
      1: 3, // 元旦 + 春节部分
      2: 4, // 春节主要假期
      4: 1, // 清明节
      5: 3, // 劳动节 + 端午节部分
      6: 1, // 端午节部分
      10: 7, // 国庆节 + 中秋节
    };

    return holidays[month] || 0;
  }
}
