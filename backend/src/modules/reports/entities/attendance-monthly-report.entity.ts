import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';
import { Employee } from '@/modules/employees/entities/employee.entity';

export enum MonthlyReportStatus {
  DRAFT = 'draft',           // 草稿状态
  PENDING = 'pending',       // 待确认
  CONFIRMED = 'confirmed',   // 已确认
  REJECTED = 'rejected',     // 已拒绝
  LOCKED = 'locked'          // 已锁定
}

@Entity('attendance_monthly_reports')
@Index(['employeeId', 'reportMonth'], { unique: true }) // 确保员工每月只有一条月报记录
export class AttendanceMonthlyReport extends BaseEntity {
  @ApiProperty({ description: '员工ID' })
  @Column({ comment: '员工ID' })
  employeeId: number;

  @ApiProperty({ description: '员工信息' })
  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ApiProperty({ description: '报告月份', example: '2024-01' })
  @Column({ length: 7, comment: '报告月份，格式：YYYY-MM' })
  @Index() // 添加索引便于按月份查询
  reportMonth: string;

  @ApiProperty({ description: '员工工号' })
  @Column({ length: 20, comment: '员工工号' })
  employeeNo: string;

  @ApiProperty({ description: '真实姓名' })
  @Column({ length: 50, comment: '真实姓名' })
  realName: string;

  @ApiProperty({ description: '员工昵称' })
  @Column({ length: 50, nullable: true, comment: '员工昵称' })
  nickname?: string;

  // ============= 出勤统计 =============
  @ApiProperty({ description: '应出勤天数' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '应出勤天数' 
  })
  expectedWorkingDays: number;

  @ApiProperty({ description: '实出勤天数' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '实出勤天数' 
  })
  actualWorkingDays: number;

  @ApiProperty({ description: '法定假天数' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '法定假天数' 
  })
  legalHolidayDays: number;

  @ApiProperty({ description: '旷工天数' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '旷工天数' 
  })
  absentDays: number;

  // ============= 各种假期天数 =============
  @ApiProperty({ description: '事假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '事假（天）' 
  })
  personalLeaveDays: number;

  @ApiProperty({ description: '年假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '年假（天）' 
  })
  annualLeaveDays: number;

  @ApiProperty({ description: '调休假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '调休假（天）' 
  })
  compensatoryLeaveDays: number;

  @ApiProperty({ description: '病假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '病假（天）' 
  })
  sickLeaveDays: number;

  @ApiProperty({ description: '哺乳假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '哺乳假（天）' 
  })
  breastfeedingLeaveDays: number;

  @ApiProperty({ description: '孕检假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '孕检假（天）' 
  })
  prenatalCheckupLeaveDays: number;

  @ApiProperty({ description: '育儿假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '育儿假（天）' 
  })
  childcareLeaveDays: number;

  @ApiProperty({ description: '婚假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '婚假（天）' 
  })
  marriageLeaveDays: number;

  @ApiProperty({ description: '陪产假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '陪产假（天）' 
  })
  paternityLeaveDays: number;

  @ApiProperty({ description: '产假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '产假（天）' 
  })
  maternityLeaveDays: number;

  @ApiProperty({ description: '丧假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '丧假（天）' 
  })
  bereavementLeaveDays: number;

  @ApiProperty({ description: '工伤假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '工伤假（天）' 
  })
  workInjuryLeaveDays: number;

  @ApiProperty({ description: '外派员工探亲假（天）' })
  @Column({ 
    type: 'decimal', 
    precision: 4, 
    scale: 1, 
    default: 0, 
    comment: '外派员工探亲假（天）' 
  })
  homeVisitLeaveDays: number;

  // ============= 考勤时间统计 =============
  @ApiProperty({ description: '迟到时长（分钟）' })
  @Column({ 
    type: 'int', 
    default: 0, 
    comment: '迟到时长（分钟）' 
  })
  totalLateMinutes: number;

  @ApiProperty({ description: '早退时长（分钟）' })
  @Column({ 
    type: 'int', 
    default: 0, 
    comment: '早退时长（分钟）' 
  })
  totalEarlyLeaveMinutes: number;

  @ApiProperty({ description: '补卡次数' })
  @Column({ 
    type: 'int', 
    default: 0, 
    comment: '补卡次数' 
  })
  makeupCardCount: number;

  @ApiProperty({ description: '公休日加班（小时）' })
  @Column({ 
    type: 'decimal', 
    precision: 6, 
    scale: 2, 
    default: 0, 
    comment: '公休日加班（小时）' 
  })
  weekendOvertimeHours: number;

  @ApiProperty({ description: '法定假日加班（小时）' })
  @Column({ 
    type: 'decimal', 
    precision: 6, 
    scale: 2, 
    default: 0, 
    comment: '法定假日加班（小时）' 
  })
  legalHolidayOvertimeHours: number;

  // ============= 补贴信息 =============
  @ApiProperty({ description: '上月出差宵夜补贴（元）' })
  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    default: 0, 
    comment: '上月出差宵夜补贴（元）' 
  })
  businessTripNightAllowance: number;

  @ApiProperty({ description: '上月工作日值班补贴（元）' })
  @Column({ 
    type: 'decimal', 
    precision: 10, 
    scale: 2, 
    default: 0, 
    comment: '上月工作日值班补贴（元）' 
  })
  workingDayDutyAllowance: number;

  // ============= 流程管理 =============
  @ApiProperty({ description: '确认状态', enum: MonthlyReportStatus })
  @Column({
    type: 'enum',
    enum: MonthlyReportStatus,
    default: MonthlyReportStatus.DRAFT,
    comment: '确认状态'
  })
  confirmationStatus: MonthlyReportStatus;

  @ApiProperty({ description: '发起确认时间' })
  @Column({ 
    type: 'timestamp', 
    nullable: true, 
    comment: '发起确认时间' 
  })
  confirmationInitiatedAt?: Date;

  @ApiProperty({ description: '确认完成时间' })
  @Column({ 
    type: 'timestamp', 
    nullable: true, 
    comment: '确认完成时间' 
  })
  confirmationCompletedAt?: Date;

  @ApiProperty({ description: '确认人ID' })
  @Column({ 
    nullable: true, 
    comment: '确认人ID' 
  })
  confirmedBy?: number;

  @ApiProperty({ description: '最后计算时间' })
  @Column({ 
    type: 'timestamp', 
    nullable: true, 
    comment: '最后一次计算的时间' 
  })
  lastCalculatedAt?: Date;

  // ============= 其他信息 =============
  @ApiProperty({ description: '备注信息' })
  @Column({ 
    type: 'text', 
    nullable: true, 
    comment: '备注信息' 
  })
  remark?: string;

  @ApiProperty({ description: '计算基础数据快照' })
  @Column({ 
    type: 'json', 
    nullable: true, 
    comment: '计算基础数据快照，用于审计' 
  })
  calculationSnapshot?: Record<string, any>;
}
