import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { QueryDailyReportDto, TriggerCalculationDto, CalculateReportsDto } from './dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('Reports - 报表统计')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily-reports')
  @ApiOperation({ 
    summary: '获取考勤日报列表',
    description: '分页查询考勤日报数据，支持按员工、日期范围、计算状态筛选'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', description: '日报ID' },
              employeeNo: { type: 'string', description: '员工工号' },
              realName: { type: 'string', description: '真实姓名' },
              reportDate: { type: 'string', description: '报告日期' },
              lateMinutes: { type: 'number', description: '迟到时长（分钟）' },
              overtimeHours: { type: 'number', description: '加班时长（小时）' },
              actualWorkingHours: { type: 'number', description: '实际工作时长（小时）' },
              calculationStatus: { type: 'string', description: '计算状态' },
            }
          }
        },
        total: { type: 'number', description: '总记录数' },
        page: { type: 'number', description: '当前页码' },
        pageSize: { type: 'number', description: '每页数量' },
        totalPages: { type: 'number', description: '总页数' },
      }
    }
  })
  async getDailyReports(@Query() queryDto: QueryDailyReportDto) {
    const options = {
      employeeId: queryDto.employeeId,
      startDate: queryDto.startDate ? new Date(queryDto.startDate) : undefined,
      endDate: queryDto.endDate ? new Date(queryDto.endDate) : undefined,
      calculationStatus: queryDto.calculationStatus,
      page: queryDto.page || 1,
      pageSize: queryDto.pageSize || 20,
    };

    return await this.reportsService.getDailyReports(options);
  }

  @Post('calculate')
  @ApiOperation({ 
    summary: '手动触发考勤日报计算',
    description: '根据指定条件计算考勤日报，支持指定日期范围、员工等条件'
  })
  @ApiResponse({
    status: 200,
    description: '计算成功',
    schema: {
      type: 'object',
      properties: {
        processedCount: { type: 'number', description: '处理的记录数量' },
        message: { type: 'string', description: '处理结果信息' }
      }
    }
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 500, description: '计算失败' })
  async calculateReports(@Body() calculateDto: CalculateReportsDto) {
    const options = {
      employeeId: calculateDto.employeeId,
      startDate: calculateDto.startDate ? new Date(calculateDto.startDate) : undefined,
      endDate: calculateDto.endDate ? new Date(calculateDto.endDate) : undefined,
      forceRecalculate: calculateDto.forceRecalculate,
    };

    const processedCount = await this.reportsService.calculateDailyReports(options);

    return {
      processedCount,
      message: `成功处理 ${processedCount} 条考勤日报记录`
    };
  }

  @Post('trigger-calculation')
  @ApiOperation({ 
    summary: '触发指定日期的考勤计算',
    description: '针对特定日期触发考勤日报计算，可指定员工范围'
  })
  @ApiResponse({
    status: 200,
    description: '触发成功',
    schema: {
      type: 'object',
      properties: {
        processedCount: { type: 'number', description: '处理的记录数量' },
        date: { type: 'string', description: '计算的日期' },
        message: { type: 'string', description: '处理结果信息' }
      }
    }
  })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  @ApiResponse({ status: 500, description: '计算失败' })
  async triggerCalculation(@Body() triggerDto: TriggerCalculationDto) {
    const date = new Date(triggerDto.date);
    const processedCount = await this.reportsService.triggerCalculationForDate(
      date,
      triggerDto.employeeIds
    );

    return {
      processedCount,
      date: triggerDto.date,
      message: triggerDto.employeeIds 
        ? `成功处理 ${triggerDto.employeeIds.length} 个员工在 ${triggerDto.date} 的考勤日报` 
        : `成功处理 ${triggerDto.date} 的所有员工考勤日报`
    };
  }

  @Get('calculation-status')
  @ApiOperation({ 
    summary: '获取计算状态统计',
    description: '获取考勤日报计算状态的统计信息'
  })
  @ApiResponse({
    status: 200,
    description: '获取成功',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', description: '总记录数' },
        success: { type: 'number', description: '成功计算数' },
        failed: { type: 'number', description: '计算失败数' },
        pending: { type: 'number', description: '待计算数' },
        processing: { type: 'number', description: '计算中数' },
      }
    }
  })
  async getCalculationStatus(@Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    // 获取各状态的统计数据
    const statusOptions = {
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    };

    const [successReports, failedReports, pendingReports, processingReports] = await Promise.all([
      this.reportsService.getDailyReports({ ...statusOptions, calculationStatus: 'success' as any }),
      this.reportsService.getDailyReports({ ...statusOptions, calculationStatus: 'failed' as any }),
      this.reportsService.getDailyReports({ ...statusOptions, calculationStatus: 'pending' as any }),
      this.reportsService.getDailyReports({ ...statusOptions, calculationStatus: 'processing' as any }),
    ]);

    const total = successReports.total + failedReports.total + pendingReports.total + processingReports.total;

    return {
      total,
      success: successReports.total,
      failed: failedReports.total,
      pending: pendingReports.total,
      processing: processingReports.total,
    };
  }
}
