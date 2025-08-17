import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsPositive,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeStatus, Gender } from '../entities/employee.entity';

export class CreateEmployeeDto {
  @ApiProperty({ description: '姓名', maxLength: 50 })
  @IsString({ message: '姓名必须是字符串' })
  @MaxLength(50, { message: '姓名长度最多50个字符' })
  name: string;

  @ApiProperty({ description: '身份证号', minLength: 18, maxLength: 18 })
  @IsString({ message: '身份证号必须是字符串' })
  @Matches(/^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, {
    message: '身份证号格式不正确',
  })
  idCard: string;

  @ApiPropertyOptional({ description: '手机号' })
  @IsOptional()
  @IsString({ message: '手机号必须是字符串' })
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @ApiPropertyOptional({ description: '邮箱' })
  @IsOptional()
  @IsEmail({}, { message: '邮箱格式不正确' })
  email?: string;

  @ApiPropertyOptional({ description: '性别', enum: Gender })
  @IsOptional()
  @IsEnum(Gender, { message: '性别值不正确' })
  gender?: Gender;

  @ApiPropertyOptional({ description: '出生日期' })
  @IsOptional()
  @IsDateString({}, { message: '出生日期格式不正确' })
  birthDate?: string;

  @ApiPropertyOptional({ description: '地址' })
  @IsOptional()
  @IsString({ message: '地址必须是字符串' })
  address?: string;

  @ApiPropertyOptional({ description: '紧急联系人' })
  @IsOptional()
  @IsString({ message: '紧急联系人必须是字符串' })
  @MaxLength(50, { message: '紧急联系人长度最多50个字符' })
  emergencyContact?: string;

  @ApiPropertyOptional({ description: '紧急联系电话' })
  @IsOptional()
  @IsString({ message: '紧急联系电话必须是字符串' })
  emergencyPhone?: string;

  @ApiPropertyOptional({ description: '照片URL' })
  @IsOptional()
  @IsString({ message: '照片URL必须是字符串' })
  photoUrl?: string;

  @ApiPropertyOptional({ description: '员工状态', enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus, { message: '员工状态值不正确' })
  status?: EmployeeStatus;

  @ApiPropertyOptional({ description: '门店ID' })
  @IsOptional()
  @IsNumber({}, { message: '门店ID必须是数字' })
  @IsPositive({ message: '门店ID必须是正整数' })
  storeId?: number;

  @ApiPropertyOptional({ description: '职位ID' })
  @IsOptional()
  @IsNumber({}, { message: '职位ID必须是数字' })
  @IsPositive({ message: '职位ID必须是正整数' })
  positionId?: number;

  @ApiPropertyOptional({ description: '入职日期' })
  @IsOptional()
  @IsDateString({}, { message: '入职日期格式不正确' })
  hireDate?: string;

  @ApiPropertyOptional({ description: '基本工资' })
  @IsOptional()
  @IsNumber({}, { message: '基本工资必须是数字' })
  @IsPositive({ message: '基本工资必须是正数' })
  baseSalary?: number;

  @ApiPropertyOptional({ description: '技能等级' })
  @IsOptional()
  @IsNumber({}, { message: '技能等级必须是数字' })
  @IsPositive({ message: '技能等级必须是正整数' })
  skillLevel?: number;

  @ApiPropertyOptional({ description: '备注' })
  @IsOptional()
  @IsString({ message: '备注必须是字符串' })
  remark?: string;
}
