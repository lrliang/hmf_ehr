import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { AttendanceResult } from '../entities/attendance-record.entity';

export class UpdateAttendanceRecordDto {
  @ApiPropertyOptional({ description: '打卡结果', enum: AttendanceResult })
  @IsOptional()
  @IsEnum(AttendanceResult)
  result?: AttendanceResult;

  @ApiPropertyOptional({ description: '异常打卡原因' })
  @IsOptional()
  @IsString()
  exceptionReason?: string;

  @ApiProperty({ description: '管理员修改备注' })
  @IsString()
  adminRemark: string;
}
