import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
import { PaginationDto, PaginatedResult } from '@/common/dto/pagination.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
    // 检查身份证号是否已存在
    const existingEmployee = await this.employeeRepository.findOne({
      where: { idCard: createEmployeeDto.idCard },
    });

    if (existingEmployee) {
      throw new ConflictException('身份证号已存在');
    }

    // 生成员工编号
    const employeeNo = await this.generateEmployeeNo(createEmployeeDto.storeId);

    const employee = this.employeeRepository.create({
      ...createEmployeeDto,
      employeeNo,
    });

    return this.employeeRepository.save(employee);
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Employee>> {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [employees, total] = await this.employeeRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return new PaginatedResult(employees, total, page, limit);
  }

  async findOne(id: number): Promise<Employee> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException(`员工 ID ${id} 不存在`);
    }

    return employee;
  }

  async findByEmployeeNo(employeeNo: string): Promise<Employee | null> {
    return this.employeeRepository.findOne({
      where: { employeeNo },
    });
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findOne(id);
    Object.assign(employee, updateEmployeeDto);
    return this.employeeRepository.save(employee);
  }

  async remove(id: number): Promise<void> {
    const employee = await this.findOne(id);
    await this.employeeRepository.softDelete(id);
  }

  private async generateEmployeeNo(storeId?: number): Promise<string> {
    const year = new Date().getFullYear();
    const storePrefix = storeId ? storeId.toString().padStart(2, '0') : '00';
    
    // 获取当年该门店的员工数量
    const count = await this.employeeRepository.count({
      where: {
        employeeNo: Like(`${storePrefix}${year}%`),
      },
    });

    const sequence = (count + 1).toString().padStart(3, '0');
    return `${storePrefix}${year}${sequence}`;
  }
}
