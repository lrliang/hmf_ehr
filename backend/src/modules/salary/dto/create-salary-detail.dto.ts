import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsDecimal, Matches, Min } from 'class-validator';
import { SalaryDetailStatus } from '../entities/salary-detail.entity';
import { Type } from 'class-transformer';

export class CreateSalaryDetailDto {
  @ApiProperty({ description: '员工ID' })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  employeeId: number;

  @ApiPropertyOptional({ description: '月度考勤报告ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  attendanceMonthlyReportId?: number;

  @ApiProperty({ description: '工资月份', example: '2024-01' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: '工资月份格式必须为 YYYY-MM' })
  reportMonth: string;

  @ApiProperty({ description: '员工工号' })
  @IsNotEmpty()
  @IsString()
  employeeNo: string;

  @ApiProperty({ description: '员工姓名' })
  @IsNotEmpty()
  @IsString()
  employeeName: string;

  @ApiPropertyOptional({ description: '应出勤天数', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  expectedWorkingDays?: number = 0;

  @ApiPropertyOptional({ description: '实出勤天数', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  actualWorkingDays?: number = 0;

  @ApiPropertyOptional({ description: '综合合计（每月的正常薪酬）', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  baseSalary?: number = 0;

  @ApiPropertyOptional({ description: '考勤工资', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  attendanceSalary?: number = 0;

  @ApiPropertyOptional({ description: '事假扣款', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  personalLeaveDeduction?: number = 0;

  @ApiPropertyOptional({ description: '补助/奖金', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  allowanceAndBonus?: number = 0;

  @ApiPropertyOptional({ description: '应发工资', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  grossSalary?: number = 0;

  @ApiPropertyOptional({ description: '社保（个人部分）', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  socialInsurance?: number = 0;

  @ApiPropertyOptional({ description: '住房公积金（个人部分）', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  housingFund?: number = 0;

  @ApiPropertyOptional({ description: '个人所得税', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  incomeTax?: number = 0;

  @ApiPropertyOptional({ description: '伙食费', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  mealFee?: number = 0;

  @ApiPropertyOptional({ description: '其他扣款', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  otherDeductions?: number = 0;

  @ApiPropertyOptional({ description: '实发工资', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  netSalary?: number = 0;

  @ApiPropertyOptional({ 
    description: '工资详情状态', 
    enum: SalaryDetailStatus, 
    default: SalaryDetailStatus.DRAFT 
  })
  @IsOptional()
  @IsEnum(SalaryDetailStatus)
  status?: SalaryDetailStatus = SalaryDetailStatus.DRAFT;

  @ApiPropertyOptional({ description: '备注信息' })
  @IsOptional()
  @IsString()
  remark?: string;
}
