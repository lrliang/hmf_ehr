import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PositionsService } from './positions.service';

@ApiTags('Positions')
@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}
  
  // TODO: 实现职位管理相关接口
}
