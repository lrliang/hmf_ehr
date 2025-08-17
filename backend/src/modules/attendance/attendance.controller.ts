import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';

@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}
  
  // TODO: 实现考勤相关接口
}
