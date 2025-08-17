import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SalaryService } from './salary.service';

@ApiTags('Salary')
@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}
  
  // TODO: 实现薪酬管理相关接口
}
