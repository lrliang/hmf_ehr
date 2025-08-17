import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StoresService } from './stores.service';

@ApiTags('Stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}
  
  // TODO: 实现门店管理相关接口
}
