import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsString, IsEnum, IsDateString } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AttendanceResult, AttendanceType } from '../entities/attendance-record.entity';

export class QueryAttendanceRecordDto {
  @ApiProperty({ description: '页码', example: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize: number;

  @ApiPropertyOptional({ description: '员工姓名' })
  @IsOptional()
  @IsString()
  employeeName?: string;

  @ApiPropertyOptional({ description: '员工ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  employeeId?: number;

  @ApiPropertyOptional({ description: '开始日期', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '结束日期', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '打卡类型', enum: AttendanceType })
  @IsOptional()
  @IsEnum(AttendanceType)
  attendanceType?: AttendanceType;

  @ApiPropertyOptional({ description: '打卡结果', enum: AttendanceResult })
  @IsOptional()
  @IsEnum(AttendanceResult)
  result?: AttendanceResult;

  @ApiPropertyOptional({ description: '门店ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  storeId?: number;

  @ApiPropertyOptional({ description: '职位ID' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  positionId?: number;

  @ApiPropertyOptional({ description: '是否手动补签' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isManual?: boolean;

  @ApiPropertyOptional({ description: '工作班次' })
  @IsOptional()
  @IsString()
  shift?: string;

  @ApiPropertyOptional({ description: '时间戳（防止缓存）' })
  @IsOptional()
  @Type(() => Number)
  _t?: number;
}
