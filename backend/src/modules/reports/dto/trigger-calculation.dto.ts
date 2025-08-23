import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsArray, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class TriggerCalculationDto {
  @ApiProperty({ 
    description: '计算日期', 
    example: '2024-01-15' 
  })
  @IsDateString({}, { message: '日期格式不正确，应为YYYY-MM-DD' })
  date: string;

  @ApiProperty({ 
    description: '指定员工ID列表（可选，不指定则计算所有员工）', 
    required: false,
    type: [Number],
    example: [1, 2, 3] 
  })
  @IsOptional()
  @IsArray({ message: '员工ID必须是数组' })
  @Type(() => Number)
  @IsNumber({}, { each: true, message: '员工ID必须是数字' })
  employeeIds?: number[];
}

export class CalculateReportsDto {
  @ApiProperty({ 
    description: '开始日期', 
    required: false,
    example: '2024-01-01' 
  })
  @IsOptional()
  @IsDateString({}, { message: '开始日期格式不正确' })
  startDate?: string;

  @ApiProperty({ 
    description: '结束日期', 
    required: false,
    example: '2024-01-31' 
  })
  @IsOptional()
  @IsDateString({}, { message: '结束日期格式不正确' })
  endDate?: string;

  @ApiProperty({ 
    description: '员工ID', 
    required: false,
    example: 1 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '员工ID必须是数字' })
  employeeId?: number;

  @ApiProperty({ 
    description: '是否强制重新计算', 
    required: false,
    default: false 
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  forceRecalculate?: boolean = false;
}
