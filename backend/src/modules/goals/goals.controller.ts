import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoalsService } from './goals.service';

@ApiTags('Goals')
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}
  
  // TODO: 实现目标管理相关接口
}
