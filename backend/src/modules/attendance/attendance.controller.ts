import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import { Roles, Role } from '@/common/decorators/roles.decorator';
import { CurrentUser, UserPayload } from '@/common/decorators/user.decorator';
// import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
// import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import {
  CreateAttendanceRecordDto,
  UpdateAttendanceRecordDto,
  QueryAttendanceRecordDto,
} from './dto';

@ApiTags('Attendance')
@Controller('attendance')
// @UseGuards(JwtAuthGuard, RolesGuard) // 暂时注释，等认证模块完成后启用
// @ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('records')
  @ApiOperation({ summary: '创建打卡记录' })
  @ApiResponse({
    status: 201,
    description: '打卡记录创建成功',
    type: AttendanceRecord,
  })
  // @Roles(Role.HR, Role.ADMIN)
  async createAttendanceRecord(
    @Body() createDto: CreateAttendanceRecordDto,
  ): Promise<AttendanceRecord> {
    return await this.attendanceService.createAttendanceRecord(createDto);
  }

  @Get('records')
  @ApiOperation({ summary: '查询打卡明细列表（分页）' })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    type: PaginatedResult<AttendanceRecord>,
  })
  @ApiQuery({ name: 'page', required: true, type: Number, description: '页码' })
  @ApiQuery({ name: 'pageSize', required: true, type: Number, description: '每页数量' })
  @ApiQuery({ name: 'employeeName', required: false, type: String, description: '员工姓名' })
  @ApiQuery({ name: 'employeeId', required: false, type: Number, description: '员工ID' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: '结束日期' })
  @ApiQuery({ name: 'attendanceType', required: false, description: '打卡类型' })
  @ApiQuery({ name: 'result', required: false, description: '打卡结果' })
  @ApiQuery({ name: 'storeId', required: false, type: Number, description: '门店ID' })
  @ApiQuery({ name: 'positionId', required: false, type: Number, description: '职位ID' })
  @ApiQuery({ name: 'isManual', required: false, type: Boolean, description: '是否手动补签' })
  @ApiQuery({ name: 'shift', required: false, type: String, description: '工作班次' })
  // @Roles(Role.HR, Role.ADMIN, Role.MANAGER)
  async getAttendanceRecords(
    @Query() queryDto: QueryAttendanceRecordDto,
  ): Promise<PaginatedResult<AttendanceRecord>> {
    return await this.attendanceService.getAttendanceRecords(queryDto);
  }

  @Get('records/export')
  @ApiOperation({ summary: '导出打卡明细数据' })
  @ApiResponse({
    status: 200,
    description: '导出成功',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'employeeName', required: false, type: String, description: '员工姓名' })
  @ApiQuery({ name: 'employeeId', required: false, type: Number, description: '员工ID' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: '结束日期' })
  @ApiQuery({ name: 'attendanceType', required: false, description: '打卡类型' })
  @ApiQuery({ name: 'result', required: false, description: '打卡结果' })
  @ApiQuery({ name: 'storeId', required: false, type: Number, description: '门店ID' })
  @ApiQuery({ name: 'positionId', required: false, type: Number, description: '职位ID' })
  @ApiQuery({ name: 'isManual', required: false, type: Boolean, description: '是否手动补签' })
  @ApiQuery({ name: 'shift', required: false, type: String, description: '工作班次' })
  @ApiQuery({ name: '_t', required: false, type: Number, description: '时间戳' })
  // @Roles(Role.HR, Role.ADMIN, Role.MANAGER)
  async exportAttendanceRecords(
    @Query() queryDto: QueryAttendanceRecordDto,
  ): Promise<{ message: string }> {
    // 临时实现，返回成功消息
    // TODO: 实现真正的Excel导出功能
    return { message: '导出功能开发中，敬请期待' };
  }

  @Get('records/:id')
  @ApiOperation({ summary: '获取单个打卡记录详情' })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    type: AttendanceRecord,
  })
  // @Roles(Role.HR, Role.ADMIN, Role.MANAGER)
  async getAttendanceRecord(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AttendanceRecord> {
    return await this.attendanceService.getAttendanceRecordById(id);
  }

  @Patch('records/:id')
  @ApiOperation({ summary: '管理员修改打卡记录' })
  @ApiResponse({
    status: 200,
    description: '修改成功',
    type: AttendanceRecord,
  })
  // @Roles(Role.HR, Role.ADMIN)
  async updateAttendanceRecord(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAttendanceRecordDto,
    // @CurrentUser() user: UserPayload,
  ): Promise<AttendanceRecord> {
    // 暂时使用固定的管理员ID，等认证模块完成后使用真实用户ID
    const adminId = 1; // user?.id || 1;
    return await this.attendanceService.updateAttendanceRecord(
      id,
      updateDto,
      adminId,
    );
  }

  @Delete('records/:id')
  @ApiOperation({ summary: '删除打卡记录' })
  @ApiResponse({
    status: 200,
    description: '删除成功',
  })
  // @Roles(Role.ADMIN)
  async deleteAttendanceRecord(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.attendanceService.deleteAttendanceRecord(id);
    return { message: '打卡记录删除成功' };
  }

  @Get('statistics/:employeeId')
  @ApiOperation({ summary: '获取员工考勤统计' })
  @ApiResponse({
    status: 200,
    description: '统计查询成功',
  })
  @ApiQuery({ name: 'startDate', required: true, type: String, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: true, type: String, description: '结束日期' })
  // @Roles(Role.HR, Role.ADMIN, Role.MANAGER)
  async getAttendanceStatistics(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.attendanceService.getAttendanceStatistics(
      employeeId,
      startDate,
      endDate,
    );
  }

  @Get('my-records')
  @ApiOperation({ summary: '获取我的打卡记录' })
  @ApiResponse({
    status: 200,
    description: '查询成功',
    type: PaginatedResult<AttendanceRecord>,
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: '页码', example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: '每页数量', example: 10 })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: '开始日期' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: '结束日期' })
  async getMyAttendanceRecords(
    @Query() queryDto: QueryAttendanceRecordDto,
    // @CurrentUser() user: UserPayload,
  ): Promise<PaginatedResult<AttendanceRecord>> {
    // 暂时使用固定的用户ID，等认证模块完成后使用真实用户ID
    const userId = 1; // user?.id || 1;
    
    // 查询当前用户的打卡记录
    const modifiedQueryDto = {
      ...queryDto,
      employeeId: userId,
      page: queryDto.page || 1,
      pageSize: queryDto.pageSize || 10,
    };
    
    return await this.attendanceService.getAttendanceRecords(modifiedQueryDto);
  }
}
