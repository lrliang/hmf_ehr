import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateSalaryDetailDto } from './create-salary-detail.dto';
import { SalaryDetailStatus } from '../entities/salary-detail.entity';

export class UpdateSalaryDetailDto extends PartialType(CreateSalaryDetailDto) {
  @ApiPropertyOptional({ description: '确认人ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  confirmedBy?: number;

  @ApiPropertyOptional({ description: '发放人ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  paidBy?: number;

  @ApiPropertyOptional({ 
    description: '工资详情状态', 
    enum: SalaryDetailStatus 
  })
  @IsOptional()
  @IsEnum(SalaryDetailStatus)
  status?: SalaryDetailStatus;
}
