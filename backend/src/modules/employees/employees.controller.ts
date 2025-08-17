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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({ summary: '创建员工' })
  @ApiResponse({ status: 201, description: '员工创建成功', type: Employee })
  @ApiResponse({ status: 409, description: '身份证号已存在' })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @ApiOperation({ summary: '获取员工列表' })
  @ApiResponse({ status: 200, description: '获取员工列表成功' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.employeesService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据ID获取员工' })
  @ApiResponse({ status: 200, description: '获取员工成功', type: Employee })
  @ApiResponse({ status: 404, description: '员工不存在' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新员工信息' })
  @ApiResponse({ status: 200, description: '员工更新成功', type: Employee })
  @ApiResponse({ status: 404, description: '员工不存在' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除员工' })
  @ApiResponse({ status: 200, description: '员工删除成功' })
  @ApiResponse({ status: 404, description: '员工不存在' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.remove(id);
  }
}
