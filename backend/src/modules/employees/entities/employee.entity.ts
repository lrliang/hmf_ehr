import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '@/common/entities/base.entity';

export enum EmployeeStatus {
  ACTIVE = 'active',
  PROBATION = 'probation',
  RESIGNED = 'resigned',
  SUSPENDED = 'suspended',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

@Entity('employees')
export class Employee extends BaseEntity {
  @ApiProperty({ description: '员工编号' })
  @Column({ unique: true, length: 20, comment: '员工编号' })
  employeeNo: string;

  @ApiProperty({ description: '姓名' })
  @Column({ length: 50, comment: '姓名' })
  name: string;

  @ApiProperty({ description: '身份证号' })
  @Column({ unique: true, length: 18, comment: '身份证号' })
  idCard: string;

  @ApiProperty({ description: '手机号' })
  @Column({ length: 20, nullable: true, comment: '手机号' })
  phone?: string;

  @ApiProperty({ description: '邮箱' })
  @Column({ length: 100, nullable: true, comment: '邮箱' })
  email?: string;

  @ApiProperty({ description: '性别', enum: Gender })
  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
    comment: '性别',
  })
  gender?: Gender;

  @ApiProperty({ description: '出生日期' })
  @Column({ type: 'date', nullable: true, comment: '出生日期' })
  birthDate?: Date;

  @ApiProperty({ description: '地址' })
  @Column({ type: 'text', nullable: true, comment: '地址' })
  address?: string;

  @ApiProperty({ description: '紧急联系人' })
  @Column({ length: 50, nullable: true, comment: '紧急联系人' })
  emergencyContact?: string;

  @ApiProperty({ description: '紧急联系电话' })
  @Column({ length: 20, nullable: true, comment: '紧急联系电话' })
  emergencyPhone?: string;

  @ApiProperty({ description: '照片URL' })
  @Column({ length: 255, nullable: true, comment: '照片URL' })
  photoUrl?: string;

  @ApiProperty({ description: '员工状态', enum: EmployeeStatus })
  @Column({
    type: 'enum',
    enum: EmployeeStatus,
    default: EmployeeStatus.ACTIVE,
    comment: '员工状态',
  })
  status: EmployeeStatus;

  @ApiProperty({ description: '门店ID' })
  @Column({ nullable: true, comment: '门店ID' })
  storeId?: number;

  @ApiProperty({ description: '职位ID' })
  @Column({ nullable: true, comment: '职位ID' })
  positionId?: number;

  @ApiProperty({ description: '入职日期' })
  @Column({ type: 'date', nullable: true, comment: '入职日期' })
  hireDate?: Date;

  @ApiProperty({ description: '基本工资' })
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    comment: '基本工资',
  })
  baseSalary?: number;

  @ApiProperty({ description: '技能等级' })
  @Column({ type: 'int', nullable: true, comment: '技能等级' })
  skillLevel?: number;

  @ApiProperty({ description: '备注' })
  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark?: string;

  // 关联关系 - 可以后续添加
  // @ManyToOne(() => Store, store => store.employees)
  // @JoinColumn({ name: 'storeId' })
  // store?: Store;

  // @ManyToOne(() => Position, position => position.employees)
  // @JoinColumn({ name: 'positionId' })
  // position?: Position;
}
