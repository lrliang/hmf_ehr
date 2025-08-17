import { Entity, Column, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import * as bcrypt from 'bcryptjs';
import { BaseEntity } from '@/common/entities/base.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum UserRole {
  ADMIN = 'admin',
  HR = 'hr',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({ description: '用户名' })
  @Column({ unique: true, length: 50, comment: '用户名' })
  username: string;

  @ApiProperty({ description: '邮箱' })
  @Column({ unique: true, length: 100, comment: '邮箱' })
  email: string;

  @Column({ length: 255, comment: '密码' })
  password: string;

  @ApiProperty({ description: '真实姓名' })
  @Column({ length: 50, comment: '真实姓名' })
  realName: string;

  @ApiProperty({ description: '手机号' })
  @Column({ length: 20, nullable: true, comment: '手机号' })
  phone?: string;

  @ApiProperty({ description: '头像URL' })
  @Column({ length: 255, nullable: true, comment: '头像URL' })
  avatar?: string;

  @ApiProperty({ description: '用户状态', enum: UserStatus })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
    comment: '用户状态',
  })
  status: UserStatus;

  @ApiProperty({ description: '用户角色', enum: UserRole, isArray: true })
  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.EMPLOYEE],
    comment: '用户角色',
  })
  roles: UserRole[];

  @ApiProperty({ description: '最后登录时间' })
  @Column({ type: 'timestamp', nullable: true, comment: '最后登录时间' })
  lastLoginAt?: Date;

  @ApiProperty({ description: '最后登录IP' })
  @Column({ length: 45, nullable: true, comment: '最后登录IP' })
  lastLoginIp?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  // 排除密码字段的序列化
  toJSON() {
    const { password, ...result } = this;
    return result;
  }
}
