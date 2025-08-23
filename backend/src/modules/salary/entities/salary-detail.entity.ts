import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';
import { Employee } from '@/modules/employees/entities/employee.entity';
import { AttendanceMonthlyReport } from '@/modules/reports/entities/attendance-monthly-report.entity';

export enum SalaryDetailStatus {
  DRAFT = 'draft',           // 草稿状态
  CALCULATED = 'calculated', // 已计算
  CONFIRMED = 'confirmed',   // 已确认
  PAID = 'paid',            // 已发放
  CANCELLED = 'cancelled'    // 已取消
}

@Entity('salary_details')
@Index(['employeeId', 'reportMonth'], { unique: true }) // 确保员工每月只有一条工资详情记录
export class SalaryDetail extends BaseEntity {
  @ApiProperty({ description: '员工ID' })
  @Column({ comment: '员工ID' })
  employeeId: number;

  @ApiProperty({ description: '员工信息' })
  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ApiProperty({ description: '月度考勤报告ID' })
  @Column({ nullable: true, comment: '月度考勤报告ID' })
  attendanceMonthlyReportId?: number;

  @ApiProperty({ description: '月度考勤报告' })
  @ManyToOne(() => AttendanceMonthlyReport, { nullable: true })
  @JoinColumn({ name: 'attendanceMonthlyReportId' })
  attendanceMonthlyReport?: AttendanceMonthlyReport;

  @ApiProperty({ description: '工资月份', example: '2024-01' })
  @Column({ length: 7, comment: '工资月份，格式：YYYY-MM' })
  @Index() // 添加索引便于按月份查询
  reportMonth: string;

  // ============= 人员信息（冗余存储，便于历史数据查询） =============
  @ApiProperty({ description: '员工工号' })
  @Column({ length: 20, comment: '员工工号' })
  employeeNo: string;

  @ApiProperty({ description: '员工姓名' })
  @Column({ length: 50, comment: '员工姓名' })
  employeeName: string;

  // ============= 考勤数据 =============
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

  // ============= 应发工资 =============
  @ApiProperty({ description: '综合合计（每月的正常薪酬）' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '综合合计（每月的正常薪酬）',
  })
  baseSalary: number;

  @ApiProperty({ description: '考勤工资' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '考勤工资（根据实际出勤天数计算）',
  })
  attendanceSalary: number;

  @ApiProperty({ description: '事假扣款' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '事假扣款',
  })
  personalLeaveDeduction: number;

  @ApiProperty({ description: '补助/奖金' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '补助/奖金',
  })
  allowanceAndBonus: number;

  @ApiProperty({ description: '应发工资' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '应发工资（考勤工资 - 事假扣款 + 补助奖金）',
  })
  grossSalary: number;

  // ============= 社保公积金 =============
  @ApiProperty({ description: '社保（个人部分）' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '社保（个人部分）',
  })
  socialInsurance: number;

  @ApiProperty({ description: '住房公积金（个人部分）' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '住房公积金（个人部分）',
  })
  housingFund: number;

  // ============= 所得税 =============
  @ApiProperty({ description: '个人所得税' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '个人所得税',
  })
  incomeTax: number;

  // ============= 税后扣发 =============
  @ApiProperty({ description: '伙食费' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '伙食费',
  })
  mealFee: number;

  @ApiProperty({ description: '其他扣款' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '其他扣款',
  })
  otherDeductions: number;

  // ============= 实发工资 =============
  @ApiProperty({ description: '实发工资' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    comment: '实发工资（应发工资 - 社保 - 公积金 - 个税 - 伙食费 - 其他扣款）',
  })
  netSalary: number;

  // ============= 状态管理 =============
  @ApiProperty({ description: '工资详情状态', enum: SalaryDetailStatus })
  @Column({
    type: 'enum',
    enum: SalaryDetailStatus,
    default: SalaryDetailStatus.DRAFT,
    comment: '工资详情状态'
  })
  status: SalaryDetailStatus;

  @ApiProperty({ description: '计算时间' })
  @Column({ 
    type: 'timestamp', 
    nullable: true, 
    comment: '工资计算时间' 
  })
  calculatedAt?: Date;

  @ApiProperty({ description: '确认时间' })
  @Column({ 
    type: 'timestamp', 
    nullable: true, 
    comment: '工资确认时间' 
  })
  confirmedAt?: Date;

  @ApiProperty({ description: '确认人ID' })
  @Column({ 
    nullable: true, 
    comment: '确认人ID' 
  })
  confirmedBy?: number;

  @ApiProperty({ description: '发放时间' })
  @Column({ 
    type: 'timestamp', 
    nullable: true, 
    comment: '工资发放时间' 
  })
  paidAt?: Date;

  @ApiProperty({ description: '发放人ID' })
  @Column({ 
    nullable: true, 
    comment: '发放人ID' 
  })
  paidBy?: number;

  @ApiProperty({ description: '备注信息' })
  @Column({ 
    type: 'text', 
    nullable: true, 
    comment: '备注信息' 
  })
  remark?: string;

  @ApiProperty({ description: '计算数据快照' })
  @Column({ 
    type: 'json', 
    nullable: true, 
    comment: '工资计算数据快照，用于审计追溯' 
  })
  calculationSnapshot?: Record<string, any>;
}
