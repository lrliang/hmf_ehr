import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsArray, Matches, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CalculateSalaryDto {
  @ApiProperty({ description: '工资月份', example: '2024-01' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: '工资月份格式必须为 YYYY-MM' })
  reportMonth: string;

  @ApiPropertyOptional({ 
    description: '员工ID列表，不传则计算所有员工', 
    type: [Number],
    example: [1, 2, 3]
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(id => parseInt(id, 10));
    }
    return value;
  })
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  employeeIds?: number[];

  @ApiPropertyOptional({ 
    description: '是否强制重新计算（覆盖已存在的记录）', 
    default: false 
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  forceRecalculate?: boolean = false;
}

export class BatchCalculateSalaryDto {
  @ApiProperty({ 
    description: '工资月份列表', 
    type: [String],
    example: ['2024-01', '2024-02', '2024-03']
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  @Matches(/^\d{4}-\d{2}$/, { message: '工资月份格式必须为 YYYY-MM', each: true })
  reportMonths: string[];

  @ApiPropertyOptional({ 
    description: '员工ID列表，不传则计算所有员工', 
    type: [Number],
    example: [1, 2, 3]
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map(id => parseInt(id, 10));
    }
    return value;
  })
  @IsArray()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  employeeIds?: number[];

  @ApiPropertyOptional({ 
    description: '是否强制重新计算（覆盖已存在的记录）', 
    default: false 
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  forceRecalculate?: boolean = false;
}

export class SalaryCalculationResultDto {
  @ApiProperty({ description: '员工ID' })
  employeeId: number;

  @ApiProperty({ description: '员工工号' })
  employeeNo: string;

  @ApiProperty({ description: '员工姓名' })
  employeeName: string;

  @ApiProperty({ description: '工资月份' })
  reportMonth: string;

  @ApiProperty({ description: '计算状态' })
  success: boolean;

  @ApiPropertyOptional({ description: '错误信息' })
  error?: string;

  @ApiPropertyOptional({ description: '工资详情ID' })
  salaryDetailId?: number;
}

export class BatchSalaryCalculationResultDto {
  @ApiProperty({ description: '总计算数量' })
  totalCount: number;

  @ApiProperty({ description: '成功数量' })
  successCount: number;

  @ApiProperty({ description: '失败数量' })
  failureCount: number;

  @ApiProperty({ description: '详细结果', type: [SalaryCalculationResultDto] })
  results: SalaryCalculationResultDto[];

  @ApiPropertyOptional({ description: '错误摘要' })
  errorSummary?: string[];
}
