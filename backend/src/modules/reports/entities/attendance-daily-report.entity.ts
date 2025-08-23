import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';
import { Employee } from '@/modules/employees/entities/employee.entity';

export enum CalculationStatus {
  SUCCESS = 'success',      // 计算成功
  FAILED = 'failed',        // 计算失败
  PENDING = 'pending',      // 等待计算
  PROCESSING = 'processing' // 计算中
}

@Entity('attendance_daily_reports')
@Index(['employeeId', 'reportDate'], { unique: true }) // 确保员工每天只有一条日报记录
export class AttendanceDailyReport extends BaseEntity {
  @ApiProperty({ description: '员工ID' })
  @Column({ comment: '员工ID' })
  employeeId: number;

  @ApiProperty({ description: '员工信息' })
  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ApiProperty({ description: '报告日期' })
  @Column({ type: 'date', comment: '报告日期' })
  @Index() // 添加索引便于按日期查询
  reportDate: Date;

  @ApiProperty({ description: '员工工号' })
  @Column({ length: 20, comment: '员工工号' })
  employeeNo: string;

  @ApiProperty({ description: '真实姓名' })
  @Column({ length: 50, comment: '真实姓名' })
  realName: string;

  @ApiProperty({ description: '员工昵称' })
  @Column({ length: 50, nullable: true, comment: '员工昵称' })
  nickname?: string;

  @ApiProperty({ description: '公司邮箱' })
  @Column({ length: 100, nullable: true, comment: '公司邮箱' })
  companyEmail?: string;

  @ApiProperty({ description: '一级部门' })
  @Column({ length: 100, nullable: true, comment: '一级部门' })
  primaryDepartment?: string;

  // ============= 打卡时间信息 =============
  @ApiProperty({ description: '首打卡时间' })
  @Column({ 
    type: 'timestamp', 
    nullable: true, 
    comment: '当天第一次打卡时间' 
  })
  firstCheckIn?: Date;

  @ApiProperty({ description: '末打卡时间' })
  @Column({ 
    type: 'timestamp', 
    nullable: true, 
    comment: '当天最后一次打卡时间' 
  })
  lastCheckOut?: Date;

  @ApiProperty({ description: '日出勤状态' })
  @Column({ 
    length: 50, 
    nullable: true, 
    comment: '当天出勤状态：正常、迟到、早退、缺勤等' 
  })
  dailyAttendanceStatus?: string;

  // ============= 假期和节假日 =============
  @ApiProperty({ description: '法定假日天数' })
  @Column({ 
    type: 'decimal', 
    precision: 3, 
    scale: 1, 
    default: 0, 
    comment: '法定假日天数' 
  })
  legalHolidayDays: number;

  @ApiProperty({ description: '补卡次数' })
  @Column({ 
    type: 'int', 
    default: 0, 
    comment: '补卡次数' 
  })
  makeupCardCount: number;

  // ============= 各种假期天数 =============
  @ApiProperty({ description: '年假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 3, 
    scale: 1, 
    default: 0, 
    comment: '年假（天）' 
  })
  annualLeaveDays: number;

  @ApiProperty({ description: '事假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 3, 
    scale: 1, 
    default: 0, 
    comment: '事假（天）' 
  })
  personalLeaveDays: number;

  @ApiProperty({ description: '病假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 3, 
    scale: 1, 
    default: 0, 
    comment: '病假（天）' 
  })
  sickLeaveDays: number;

  @ApiProperty({ description: '丧假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 3, 
    scale: 1, 
    default: 0, 
    comment: '丧假（天）' 
  })
  bereavementLeaveDays: number;

  @ApiProperty({ description: '育儿假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 3, 
    scale: 1, 
    default: 0, 
    comment: '育儿假（天）' 
  })
  childcareLeaveDays: number;

  @ApiProperty({ description: '产假工作日（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 3, 
    scale: 1, 
    default: 0, 
    comment: '产假工作日（天）' 
  })
  maternityLeaveWorkingDays: number;

  // ============= 加班时间统计 =============
  @ApiProperty({ description: '公休日加班（小时）' })
  @Column({ 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    default: 0, 
    comment: '公休日加班（小时）' 
  })
  weekendOvertimeHours: number;

  @ApiProperty({ description: '法定假日加班（小时）' })
  @Column({ 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    default: 0, 
    comment: '法定假日加班（小时）' 
  })
  legalHolidayOvertimeHours: number;

  @ApiProperty({ description: '迟到时长（分钟）' })
  @Column({ 
    type: 'int', 
    default: 0, 
    comment: '迟到时长（分钟）' 
  })
  lateMinutes: number;

  @ApiProperty({ description: '计算消息' })
  @Column({ type: 'text', nullable: true, comment: '计算过程中的消息或异常信息' })
  calculationMessage?: string;

  @ApiProperty({ description: '计算状态', enum: CalculationStatus })
  @Column({
    type: 'enum',
    enum: CalculationStatus,
    default: CalculationStatus.PENDING,
    comment: '计算状态'
  })
  calculationStatus: CalculationStatus;

  @ApiProperty({ description: '陪产假工作日天数' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '陪产假工作日天数' 
  })
  paternityLeaveWorkingDays: number;

  @ApiProperty({ description: '工作班次' })
  @Column({ length: 50, nullable: true, comment: '工作班次' })
  shift?: string;

  @ApiProperty({ description: '公出时长（小时）' })
  @Column({ 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    default: 0, 
    comment: '公出时长（小时）' 
  })
  businessTripHours: number;

  // 额外的统计字段，便于后续扩展
  @ApiProperty({ description: '实际工作时长（小时）' })
  @Column({ 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    nullable: true, 
    comment: '实际工作时长（小时）' 
  })
  actualWorkingHours?: number;

  @ApiProperty({ description: '加班时长（小时）' })
  @Column({ 
    type: 'decimal', 
    precision: 5, 
    scale: 2, 
    default: 0, 
    comment: '加班时长（小时）' 
  })
  overtimeHours: number;

  @ApiProperty({ description: '早退时长（分钟）' })
  @Column({ 
    type: 'int', 
    default: 0, 
    comment: '早退时长（分钟）' 
  })
  earlyLeaveMinutes: number;

  @ApiProperty({ description: '缺勤状态' })
  @Column({ 
    default: false, 
    comment: '是否缺勤' 
  })
  isAbsent: boolean;

  @ApiProperty({ description: '最后计算时间' })
  @Column({ 
    type: 'timestamp', 
    nullable: true, 
    comment: '最后一次计算的时间' 
  })
  lastCalculatedAt?: Date;

  @ApiProperty({ description: '备注信息' })
  @Column({ type: 'text', nullable: true, comment: '备注信息' })
  remark?: string;
}
