import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsString, IsEnum, IsOptional, IsDateString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceResult, AttendanceType } from '../entities/attendance-record.entity';

export class CreateAttendanceRecordDto {
  @ApiProperty({ description: '员工ID' })
  @IsNotEmpty()
  @IsInt()
  @Type(() => Number)
  employeeId: number;

  @ApiProperty({ description: '考勤日期', example: '2024-01-15' })
  @IsNotEmpty()
  @IsDateString()
  attendanceDate: string;

  @ApiProperty({ description: '考勤时间（应打卡时间）', example: '09:00' })
  @IsNotEmpty()
  @IsString()
  attendanceTime: string;

  @ApiPropertyOptional({ description: '实际打卡时间' })
  @IsOptional()
  @IsDateString()
  checkTime?: string;

  @ApiProperty({ description: '打卡类型', enum: AttendanceType })
  @IsNotEmpty()
  @IsEnum(AttendanceType)
  attendanceType: AttendanceType;

  @ApiProperty({ description: '打卡结果', enum: AttendanceResult })
  @IsNotEmpty()
  @IsEnum(AttendanceResult)
  result: AttendanceResult;

  @ApiPropertyOptional({ description: '打卡地址' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: '打卡经纬度' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ description: '打卡备注' })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiPropertyOptional({ description: '异常打卡原因' })
  @IsOptional()
  @IsString()
  exceptionReason?: string;

  @ApiPropertyOptional({ description: '打卡设备' })
  @IsOptional()
  @IsString()
  device?: string;

  @ApiPropertyOptional({ description: '设备信息' })
  @IsOptional()
  @IsString()
  deviceInfo?: string;

  @ApiPropertyOptional({ description: '是否手动补签', default: false })
  @IsOptional()
  @IsBoolean()
  isManual?: boolean = false;

  @ApiPropertyOptional({ description: '工作班次' })
  @IsOptional()
  @IsString()
  shift?: string;
}
