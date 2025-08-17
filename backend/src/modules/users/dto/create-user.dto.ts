import { IsEmail, IsString, IsOptional, IsEnum, IsArray, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus, UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({ description: '用户名', minLength: 3, maxLength: 50 })
  @IsString({ message: '用户名必须是字符串' })
  @MinLength(3, { message: '用户名长度至少3个字符' })
  @MaxLength(50, { message: '用户名长度最多50个字符' })
  username: string;

  @ApiProperty({ description: '邮箱' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ description: '密码', minLength: 6 })
  @IsString({ message: '密码必须是字符串' })
  @MinLength(6, { message: '密码长度至少6个字符' })
  password: string;

  @ApiProperty({ description: '真实姓名', maxLength: 50 })
  @IsString({ message: '真实姓名必须是字符串' })
  @MaxLength(50, { message: '真实姓名长度最多50个字符' })
  realName: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  phone?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsString({ message: '头像URL必须是字符串' })
  avatar?: string;

  @ApiPropertyOptional({ description: '用户状态', enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus, { message: '用户状态值不正确' })
  status?: UserStatus;

  @ApiPropertyOptional({ description: '用户角色', enum: UserRole, isArray: true })
  @IsOptional()
  @IsArray({ message: '用户角色必须是数组' })
  @IsEnum(UserRole, { each: true, message: '用户角色值不正确' })
  roles?: UserRole[];
}
