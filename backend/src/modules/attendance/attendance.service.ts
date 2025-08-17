import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AttendanceRecord } from './entities/attendance-record.entity';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import {
  CreateAttendanceRecordDto,
  UpdateAttendanceRecordDto,
  QueryAttendanceRecordDto,
} from './dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRecordRepository: Repository<AttendanceRecord>,
  ) {}

  /**
   * 创建打卡记录
   */
  async createAttendanceRecord(
    createDto: CreateAttendanceRecordDto,
  ): Promise<AttendanceRecord> {
    const attendanceRecord = this.attendanceRecordRepository.create({
      ...createDto,
      attendanceDate: new Date(createDto.attendanceDate),
      checkTime: createDto.checkTime ? new Date(createDto.checkTime) : null,
    });

    return await this.attendanceRecordRepository.save(attendanceRecord);
  }

  /**
   * 查询打卡明细（分页）
   */
  async getAttendanceRecords(
    queryDto: QueryAttendanceRecordDto,
  ): Promise<PaginatedResult<AttendanceRecord>> {
    const { page, pageSize, ...filters } = queryDto;
    
    const queryBuilder = this.createQueryBuilder(filters);
    
    // 获取总数
    const total = await queryBuilder.getCount();
    
    // 分页查询
    const records = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('ar.attendanceDate', 'DESC')
      .addOrderBy('ar.attendanceTime', 'ASC')
      .getMany();

    return new PaginatedResult(records, total, page, pageSize);
  }

  /**
   * 根据ID获取单个打卡记录
   */
  async getAttendanceRecordById(id: number): Promise<AttendanceRecord> {
    const record = await this.attendanceRecordRepository.findOne({
      where: { id },
      relations: ['employee'],
    });

    if (!record) {
      throw new NotFoundException(`打卡记录不存在: ID ${id}`);
    }

    return record;
  }

  /**
   * 更新打卡记录（管理员修改）
   */
  async updateAttendanceRecord(
    id: number,
    updateDto: UpdateAttendanceRecordDto,
    adminId: number,
  ): Promise<AttendanceRecord> {
    const record = await this.getAttendanceRecordById(id);

    // 更新记录
    Object.assign(record, updateDto, {
      modifiedBy: adminId,
      modifiedAt: new Date(),
    });

    return await this.attendanceRecordRepository.save(record);
  }

  /**
   * 删除打卡记录
   */
  async deleteAttendanceRecord(id: number): Promise<void> {
    const record = await this.getAttendanceRecordById(id);
    await this.attendanceRecordRepository.remove(record);
  }

  /**
   * 获取员工的考勤统计
   */
  async getAttendanceStatistics(
    employeeId: number,
    startDate: string,
    endDate: string,
  ) {
    const queryBuilder = this.attendanceRecordRepository
      .createQueryBuilder('ar')
      .leftJoin('ar.employee', 'e')
      .where('ar.employeeId = :employeeId', { employeeId })
      .andWhere('ar.attendanceDate >= :startDate', { startDate })
      .andWhere('ar.attendanceDate <= :endDate', { endDate });

    const records = await queryBuilder.getMany();

    // 统计各种打卡结果的数量
    const statistics = records.reduce(
      (acc, record) => {
        acc.total++;
        acc[record.result] = (acc[record.result] || 0) + 1;
        if (record.isManual) {
          acc.manual++;
        }
        return acc;
      },
      {
        total: 0,
        on_time: 0,
        late: 0,
        early_leave: 0,
        absent: 0,
        overtime: 0,
        manual: 0,
      },
    );

    return statistics;
  }

  /**
   * 创建查询构建器
   */
  private createQueryBuilder(
    filters: Omit<QueryAttendanceRecordDto, 'page' | 'pageSize'>,
  ): SelectQueryBuilder<AttendanceRecord> {
    const queryBuilder = this.attendanceRecordRepository
      .createQueryBuilder('ar')
      .leftJoinAndSelect('ar.employee', 'e');

    // 按员工姓名搜索
    if (filters.employeeName) {
      queryBuilder.andWhere('e.name LIKE :employeeName', {
        employeeName: `%${filters.employeeName}%`,
      });
    }

    // 按员工ID筛选
    if (filters.employeeId) {
      queryBuilder.andWhere('ar.employeeId = :employeeId', {
        employeeId: filters.employeeId,
      });
    }

    // 按日期范围筛选
    if (filters.startDate) {
      queryBuilder.andWhere('ar.attendanceDate >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('ar.attendanceDate <= :endDate', {
        endDate: filters.endDate,
      });
    }

    // 按打卡类型筛选
    if (filters.attendanceType) {
      queryBuilder.andWhere('ar.attendanceType = :attendanceType', {
        attendanceType: filters.attendanceType,
      });
    }

    // 按打卡结果筛选
    if (filters.result) {
      queryBuilder.andWhere('ar.result = :result', {
        result: filters.result,
      });
    }

    // 按门店ID筛选
    if (filters.storeId) {
      queryBuilder.andWhere('e.storeId = :storeId', {
        storeId: filters.storeId,
      });
    }

    // 按职位ID筛选
    if (filters.positionId) {
      queryBuilder.andWhere('e.positionId = :positionId', {
        positionId: filters.positionId,
      });
    }

    // 按是否手动补签筛选
    if (typeof filters.isManual === 'boolean') {
      queryBuilder.andWhere('ar.isManual = :isManual', {
        isManual: filters.isManual,
      });
    }

    // 按班次筛选
    if (filters.shift) {
      queryBuilder.andWhere('ar.shift = :shift', {
        shift: filters.shift,
      });
    }

    return queryBuilder;
  }
}
