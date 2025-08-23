import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsNumber, IsEnum, IsPositive, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CalculationStatus } from '../entities/attendance-daily-report.entity';

export class QueryDailyReportDto {
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
    description: '计算状态', 
    enum: CalculationStatus,
    required: false,
    example: CalculationStatus.SUCCESS 
  })
  @IsOptional()
  @IsEnum(CalculationStatus, { message: '计算状态值无效' })
  calculationStatus?: CalculationStatus;

  @ApiProperty({ 
    description: '页码', 
    required: false,
    default: 1,
    minimum: 1 
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: '页码必须是正数' })
  @Min(1, { message: '页码最小为1' })
  page?: number = 1;

  @ApiProperty({ 
    description: '每页数量', 
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100 
  })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: '每页数量必须是正数' })
  @Min(1, { message: '每页数量最小为1' })
  pageSize?: number = 20;
}
