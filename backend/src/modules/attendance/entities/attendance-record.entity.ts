import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';
import { Employee } from '@/modules/employees/entities/employee.entity';

export enum AttendanceResult {
  ON_TIME = 'on_time',         // 正常打卡
  LATE = 'late',               // 迟到
  EARLY_LEAVE = 'early_leave', // 早退
  ABSENT = 'absent',           // 缺勤
  OVERTIME = 'overtime',       // 加班
  MANUAL = 'manual',           // 手动补签
  INVALID = 'invalid',         // 无效打卡
}

export enum AttendanceType {
  CHECK_IN = 'check_in',       // 上班打卡
  CHECK_OUT = 'check_out',     // 下班打卡
  BREAK_OUT = 'break_out',     // 外出打卡
  BREAK_IN = 'break_in',       // 回到打卡
}

@Entity('attendance_records')
export class AttendanceRecord extends BaseEntity {
  @ApiProperty({ description: '员工ID' })
  @Column({ comment: '员工ID' })
  employeeId: number;

  @ApiProperty({ description: '员工信息' })
  @ManyToOne(() => Employee, { eager: true })
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @ApiProperty({ description: '考勤日期' })
  @Column({ type: 'date', comment: '考勤日期' })
  attendanceDate: Date;

  @ApiProperty({ description: '考勤时间（应打卡时间）' })
  @Column({ type: 'time', comment: '考勤时间（应打卡时间）' })
  attendanceTime: string;

  @ApiProperty({ description: '实际打卡时间' })
  @Column({ type: 'timestamp', nullable: true, comment: '实际打卡时间' })
  checkTime?: Date;

  @ApiProperty({ description: '打卡类型', enum: AttendanceType })
  @Column({
    type: 'enum',
    enum: AttendanceType,
    comment: '打卡类型'
  })
  attendanceType: AttendanceType;

  @ApiProperty({ description: '打卡结果', enum: AttendanceResult })
  @Column({
    type: 'enum',
    enum: AttendanceResult,
    comment: '打卡结果'
  })
  result: AttendanceResult;

  @ApiProperty({ description: '打卡地址' })
  @Column({ type: 'text', nullable: true, comment: '打卡地址' })
  address?: string;

  @ApiProperty({ description: '打卡经纬度' })
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '打卡经纬度' })
  location?: string;

  @ApiProperty({ description: '打卡备注' })
  @Column({ type: 'text', nullable: true, comment: '打卡备注' })
  remark?: string;

  @ApiProperty({ description: '异常打卡原因' })
  @Column({ type: 'text', nullable: true, comment: '异常打卡原因' })
  exceptionReason?: string;

  @ApiProperty({ description: '打卡设备' })
  @Column({ type: 'varchar', length: 100, nullable: true, comment: '打卡设备' })
  device?: string;

  @ApiProperty({ description: '设备信息（如手机型号、操作系统等）' })
  @Column({ type: 'text', nullable: true, comment: '设备信息' })
  deviceInfo?: string;

  @ApiProperty({ description: '管理员修改备注' })
  @Column({ type: 'text', nullable: true, comment: '管理员修改备注' })
  adminRemark?: string;

  @ApiProperty({ description: '管理员修改人ID' })
  @Column({ nullable: true, comment: '管理员修改人ID' })
  modifiedBy?: number;

  @ApiProperty({ description: '管理员修改时间' })
  @Column({ type: 'timestamp', nullable: true, comment: '管理员修改时间' })
  modifiedAt?: Date;

  @ApiProperty({ description: '是否手动补签' })
  @Column({ default: false, comment: '是否手动补签' })
  isManual: boolean;

  @ApiProperty({ description: '工作班次' })
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '工作班次' })
  shift?: string;
}
