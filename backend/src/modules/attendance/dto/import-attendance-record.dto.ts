import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { AttendanceResult, AttendanceType } from '../entities/attendance-record.entity';

// Excel导入的单行数据接口
export interface ExcelRowData {
  姓名: string;
  考勤日期: string;
  考勤时间: string;
  打卡时间?: string;
  打卡结果: string;
  打卡地址?: string;
  打卡备注?: string;
  异常打卡原因?: string;
  打卡设备?: string;
  管理员修改备注?: string;
}

// 导入后的单条记录DTO
export class ImportAttendanceRecordDto {
  @ApiProperty({ description: '员工姓名' })
  @IsString()
  employeeName: string;

  @ApiProperty({ description: '考勤日期' })
  @IsString()
  attendanceDate: string;

  @ApiProperty({ description: '考勤时间' })
  @IsString()
  attendanceTime: string;

  @ApiProperty({ description: '打卡时间', required: false })
  @IsOptional()
  @IsString()
  checkTime?: string;

  @ApiProperty({ description: '打卡类型' })
  @IsEnum(AttendanceType)
  attendanceType: AttendanceType;

  @ApiProperty({ description: '打卡结果' })
  @IsEnum(AttendanceResult)
  result: AttendanceResult;

  @ApiProperty({ description: '打卡地址', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: '打卡备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: '异常打卡原因', required: false })
  @IsOptional()
  @IsString()
  exceptionReason?: string;

  @ApiProperty({ description: '打卡设备', required: false })
  @IsOptional()
  @IsString()
  device?: string;

  @ApiProperty({ description: '管理员修改备注', required: false })
  @IsOptional()
  @IsString()
  adminRemark?: string;
}

// 导入结果统计
export class ImportResultDto {
  @ApiProperty({ description: '成功导入数量' })
  success: number;

  @ApiProperty({ description: '失败数量' })
  failed: number;

  @ApiProperty({ description: '总处理数量' })
  total: number;

  @ApiProperty({ description: '错误列表', required: false })
  errors?: ImportErrorDto[];

  @ApiProperty({ description: '导入耗时(毫秒)', required: false })
  duration?: number;
}

// 导入错误详情
export class ImportErrorDto {
  @ApiProperty({ description: '出错行号' })
  row: number;

  @ApiProperty({ description: '错误类型' })
  type: string;

  @ApiProperty({ description: '错误信息' })
  message: string;

  @ApiProperty({ description: '原始数据', required: false })
  data?: any;
}

// 打卡结果映射
export const RESULT_MAPPING: Record<string, AttendanceResult> = {
  '正常打卡': AttendanceResult.ON_TIME,
  '正常': AttendanceResult.ON_TIME,
  '迟到': AttendanceResult.LATE,
  '早退': AttendanceResult.EARLY_LEAVE,
  '缺勤': AttendanceResult.ABSENT,
  '加班': AttendanceResult.OVERTIME,
  '手动补签': AttendanceResult.MANUAL,
  '补签': AttendanceResult.MANUAL,
};

// 打卡类型映射（根据时间判断或用户指定）
export const TYPE_MAPPING: Record<string, AttendanceType> = {
  '上班打卡': AttendanceType.CHECK_IN,
  '上班': AttendanceType.CHECK_IN,
  '下班打卡': AttendanceType.CHECK_OUT,
  '下班': AttendanceType.CHECK_OUT,
  '外出打卡': AttendanceType.BREAK_OUT,
  '外出': AttendanceType.BREAK_OUT,
  '回到打卡': AttendanceType.BREAK_IN,
  '回到': AttendanceType.BREAK_IN,
};
