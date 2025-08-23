import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiBearerAuth,
  ApiExtraModels
} from '@nestjs/swagger';
import { SalaryService } from './salary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { 
  CreateSalaryDetailDto, 
  UpdateSalaryDetailDto, 
  QuerySalaryDetailDto,
  CalculateSalaryDto,
  BatchCalculateSalaryDto,
  SalaryCalculationResultDto,
  BatchSalaryCalculationResultDto
} from './dto';
import { SalaryDetail } from './entities/salary-detail.entity';
import { PaginatedResult } from '@/common/dto/pagination.dto';

@ApiTags('Salary Management')
@Controller('salary')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiExtraModels(
  SalaryDetail,
  PaginatedResult,
  SalaryCalculationResultDto,
  BatchSalaryCalculationResultDto
)
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post()
  @ApiOperation({ 
    summary: '创建工资详情',
    description: '手动创建员工工资详情记录'
  })
  @ApiResponse({ 
    status: 201, 
    description: '工资详情创建成功',
    type: SalaryDetail
  })
  @ApiResponse({ status: 409, description: '工资详情已存在' })
  async create(@Body() createSalaryDetailDto: CreateSalaryDetailDto): Promise<SalaryDetail> {
    return this.salaryService.create(createSalaryDetailDto);
  }

  @Get()
  @ApiOperation({ 
    summary: '查询工资详情列表',
    description: '分页查询工资详情，支持多种筛选条件'
  })
  @ApiResponse({ 
    status: 200, 
    description: '工资详情列表查询成功',
    schema: {
      allOf: [
        { $ref: '#/components/schemas/PaginatedResult' },
        {
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/SalaryDetail' }
            }
          }
        }
      ]
    }
  })
  async findAll(@Query() query: QuerySalaryDetailDto): Promise<PaginatedResult<SalaryDetail>> {
    console.log('Query parameters:', JSON.stringify(query, null, 2));
    return this.salaryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: '查询单个工资详情',
    description: '根据ID查询工资详情的详细信息'
  })
  @ApiParam({ name: 'id', description: '工资详情ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: '工资详情查询成功',
    type: SalaryDetail
  })
  @ApiResponse({ status: 404, description: '工资详情不存在' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<SalaryDetail> {
    return this.salaryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: '更新工资详情',
    description: '更新员工工资详情信息，可用于调整工资或更新状态'
  })
  @ApiParam({ name: 'id', description: '工资详情ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: '工资详情更新成功',
    type: SalaryDetail
  })
  @ApiResponse({ status: 404, description: '工资详情不存在' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSalaryDetailDto: UpdateSalaryDetailDto
  ): Promise<SalaryDetail> {
    return this.salaryService.update(id, updateSalaryDetailDto);
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: '删除工资详情',
    description: '软删除工资详情记录'
  })
  @ApiParam({ name: 'id', description: '工资详情ID', type: 'number' })
  @ApiResponse({ status: 200, description: '工资详情删除成功' })
  @ApiResponse({ status: 404, description: '工资详情不存在' })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.salaryService.remove(id);
    return { message: '工资详情删除成功' };
  }

  @Post('calculate')
  @ApiOperation({ 
    summary: '计算员工工资',
    description: '基于员工基础薪资和月度考勤报告计算指定月份的工资'
  })
  @ApiResponse({ 
    status: 200, 
    description: '工资计算完成',
    type: BatchSalaryCalculationResultDto
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @HttpCode(HttpStatus.OK)
  async calculateSalary(@Body() calculateDto: CalculateSalaryDto): Promise<BatchSalaryCalculationResultDto> {
    return this.salaryService.calculateSalary(calculateDto);
  }

  @Post('batch-calculate')
  @ApiOperation({ 
    summary: '批量计算多月工资',
    description: '批量计算多个月份的员工工资'
  })
  @ApiResponse({ 
    status: 200, 
    description: '批量工资计算完成',
    type: [BatchSalaryCalculationResultDto]
  })
  @ApiResponse({ status: 400, description: '参数验证失败' })
  @HttpCode(HttpStatus.OK)
  async batchCalculateSalary(@Body() batchDto: BatchCalculateSalaryDto): Promise<BatchSalaryCalculationResultDto[]> {
    return this.salaryService.batchCalculateSalary(batchDto);
  }

  @Patch(':id/confirm')
  @ApiOperation({ 
    summary: '确认工资详情',
    description: '确认员工工资详情，将状态更新为已确认'
  })
  @ApiParam({ name: 'id', description: '工资详情ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: '工资确认成功',
    type: SalaryDetail
  })
  @ApiResponse({ status: 404, description: '工资详情不存在' })
  async confirmSalary(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { confirmedBy: number }
  ): Promise<SalaryDetail> {
    return this.salaryService.update(id, {
      status: 'confirmed' as any,
      confirmedBy: body.confirmedBy
    });
  }

  @Patch(':id/pay')
  @ApiOperation({ 
    summary: '标记工资已发放',
    description: '标记员工工资为已发放状态'
  })
  @ApiParam({ name: 'id', description: '工资详情ID', type: 'number' })
  @ApiResponse({ 
    status: 200, 
    description: '工资发放标记成功',
    type: SalaryDetail
  })
  @ApiResponse({ status: 404, description: '工资详情不存在' })
  async markAsPaid(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { paidBy: number }
  ): Promise<SalaryDetail> {
    return this.salaryService.update(id, {
      status: 'paid' as any,
      paidBy: body.paidBy
    });
  }

  @Get('statistics/:reportMonth')
  @ApiOperation({ 
    summary: '获取月度工资统计',
    description: '获取指定月份的工资统计信息'
  })
  @ApiParam({ name: 'reportMonth', description: '报告月份', example: '2024-01' })
  @ApiResponse({ 
    status: 200, 
    description: '月度工资统计获取成功'
  })
  async getMonthlyStatistics(@Param('reportMonth') reportMonth: string) {
    const queryDto = new QuerySalaryDetailDto();
    queryDto.reportMonth = reportMonth;
    queryDto.page = 1;
    queryDto.limit = 1000; // 获取较多数据用于统计

    const result = await this.salaryService.findAll(queryDto);
    
    // 确保 result.data 存在，如果不存在则使用空数组
    const items = result?.data || [];
    
    const statistics = {
      reportMonth,
      totalEmployees: items.length,
      totalGrossSalary: items.reduce((sum, item) => sum + (item.grossSalary || 0), 0),
      totalNetSalary: items.reduce((sum, item) => sum + (item.netSalary || 0), 0),
      totalSocialInsurance: items.reduce((sum, item) => sum + (item.socialInsurance || 0), 0),
      totalHousingFund: items.reduce((sum, item) => sum + (item.housingFund || 0), 0),
      totalIncomeTax: items.reduce((sum, item) => sum + (item.incomeTax || 0), 0),
      statusDistribution: {
        draft: items.filter(item => item.status === 'draft').length,
        calculated: items.filter(item => item.status === 'calculated').length,
        confirmed: items.filter(item => item.status === 'confirmed').length,
        paid: items.filter(item => item.status === 'paid').length,
        cancelled: items.filter(item => item.status === 'cancelled').length,
      }
    };

    return {
      success: true,
      data: statistics,
      message: '月度工资统计获取成功'
    };
  }
}
