import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LeaveService } from './leave.service';

@ApiTags('Leave')
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}
  
  // TODO: 实现请假相关接口
}
