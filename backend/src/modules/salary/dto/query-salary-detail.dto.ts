import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, Matches, IsArray } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SalaryDetailStatus } from '../entities/salary-detail.entity';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class QuerySalaryDetailDto extends PaginationDto {
  @ApiPropertyOptional({ description: '员工ID' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  employeeId?: number;

  @ApiPropertyOptional({ description: '员工工号' })
  @IsOptional()
  @IsString()
  employeeNo?: string;

  @ApiPropertyOptional({ description: '员工姓名' })
  @IsOptional()
  @IsString()
  employeeName?: string;

  @ApiPropertyOptional({ description: '工资月份', example: '2024-01' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: '工资月份格式必须为 YYYY-MM' })
  reportMonth?: string;

  @ApiPropertyOptional({ 
    description: '工资详情状态', 
    enum: SalaryDetailStatus,
    isArray: true,
    example: [SalaryDetailStatus.CALCULATED, SalaryDetailStatus.CONFIRMED]
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',');
    }
    return value;
  })
  @IsArray()
  @IsEnum(SalaryDetailStatus, { each: true })
  status?: SalaryDetailStatus[];

  @ApiPropertyOptional({ description: '开始月份', example: '2024-01' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: '开始月份格式必须为 YYYY-MM' })
  startMonth?: string;

  @ApiPropertyOptional({ description: '结束月份', example: '2024-12' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, { message: '结束月份格式必须为 YYYY-MM' })
  endMonth?: string;

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
    description: '排序字段', 
    example: 'reportMonth',
    default: 'reportMonth'
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'reportMonth';

  @ApiPropertyOptional({ 
    description: '排序方向', 
    enum: ['ASC', 'DESC'],
    default: 'DESC'
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
