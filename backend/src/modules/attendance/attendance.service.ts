import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AttendanceRecord, AttendanceResult, AttendanceType } from './entities/attendance-record.entity';
import { Employee } from '../employees/entities/employee.entity';
import { PaginatedResult } from '@/common/dto/pagination.dto';
import * as XLSX from 'xlsx';
import {
  CreateAttendanceRecordDto,
  UpdateAttendanceRecordDto,
  QueryAttendanceRecordDto,
  ExcelRowData,
  ImportResultDto,
  ImportErrorDto,
  RESULT_MAPPING,
  TYPE_MAPPING,
} from './dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceRecord)
    private readonly attendanceRecordRepository: Repository<AttendanceRecord>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
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
        invalid: 0,
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

  /**
   * 导入Excel文件中的打卡记录
   */
  async importAttendanceRecords(file: Express.Multer.File): Promise<ImportResultDto> {
    const startTime = Date.now();

    try {
      // 读取Excel文件
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData: ExcelRowData[] = XLSX.utils.sheet_to_json(worksheet);

      if (!rawData || rawData.length === 0) {
        throw new BadRequestException('Excel文件为空或格式不正确');
      }

      // 验证必需的列是否存在
      this.validateExcelHeaders(rawData[0]);

      // 获取所有员工信息用于查找
      const employees = await this.employeeRepository.find({
        select: ['id', 'name', 'employeeNo'],
      });
      const employeeMap = new Map<string, Employee>();
      employees.forEach(emp => {
        employeeMap.set(emp.name, emp);
      });

      const result: ImportResultDto = {
        success: 0,
        failed: 0,
        skipped: 0,
        total: rawData.length,
        errors: [],
        duration: 0,
      };

      // 批量处理数据
      const validRecords: AttendanceRecord[] = [];

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const rowNumber = i + 2; // Excel行号从2开始（第1行是标题）

        try {
          const record = await this.processExcelRow(row, employeeMap, rowNumber);
          if (record) {
            // 检查是否已存在相同的打卡记录
            const isDuplicate = await this.checkDuplicateRecord(
              record.employeeId,
              record.attendanceDate,
              record.attendanceType
            );

            if (isDuplicate) {
              result.skipped++;
            } else {
              validRecords.push(record);
              result.success++;
            }
          }
        } catch (error) {
          result.failed++;
          result.errors.push({
            row: rowNumber,
            type: 'ValidationError',
            message: error.message,
            data: row,
          });
        }
      }

      // 批量保存有效记录
      if (validRecords.length > 0) {
        await this.attendanceRecordRepository.save(validRecords);
      }

      result.duration = Date.now() - startTime;
      return result;

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`文件处理失败: ${error.message}`);
    }
  }

  /**
   * 验证Excel文件的列标题
   */
  private validateExcelHeaders(firstRow: ExcelRowData): void {
    const requiredHeaders = ['姓名', '考勤日期', '考勤时间', '打卡结果'];
    const missingHeaders = requiredHeaders.filter(header => !(header in firstRow));

    if (missingHeaders.length > 0) {
      throw new BadRequestException(
        `Excel文件缺少必需的列: ${missingHeaders.join(', ')}`
      );
    }
  }

  /**
   * 检查是否存在重复的打卡记录
   */
  private async checkDuplicateRecord(
    employeeId: number,
    attendanceDate: Date,
    attendanceType: AttendanceType
  ): Promise<boolean> {
    const existingRecord = await this.attendanceRecordRepository.findOne({
      where: {
        employeeId,
        attendanceDate,
        attendanceType,
      },
    });

    return !!existingRecord;
  }

  /**
   * 处理Excel中的单行数据
   */
  private async processExcelRow(
    row: ExcelRowData,
    employeeMap: Map<string, Employee>,
    rowNumber: number
  ): Promise<AttendanceRecord | null> {
    // 验证必需字段
    if (!row.姓名 || String(row.姓名).trim() === '') {
      throw new Error(`第${rowNumber}行: 姓名不能为空`);
    }
    if (!row.考勤日期) {
      throw new Error(`第${rowNumber}行: 考勤日期不能为空`);
    }
    if (!row.考勤时间 || String(row.考勤时间).trim() === '') {
      throw new Error(`第${rowNumber}行: 考勤时间不能为空`);
    }
    if (!row.打卡结果 || String(row.打卡结果).trim() === '') {
      throw new Error(`第${rowNumber}行: 打卡结果不能为空`);
    }

    // 查找员工
    const employeeName = String(row.姓名).trim();
    const employee = employeeMap.get(employeeName);
    if (!employee) {
      throw new Error(`第${rowNumber}行: 找不到员工 "${employeeName}"`);
    }

    // 转换打卡结果
    const resultValue = String(row.打卡结果).trim();
    const result = RESULT_MAPPING[resultValue];
    if (!result) {
      throw new Error(
        `第${rowNumber}行: 无效的打卡结果 "${resultValue}"，支持的值: ${Object.keys(RESULT_MAPPING).join(', ')}`
      );
    }

    // 解析日期
    let attendanceDate: Date;
    try {
      if (typeof row.考勤日期 === 'number') {
        // Excel日期序列号
        attendanceDate = new Date((row.考勤日期 - 25569) * 86400 * 1000);
      } else {
        attendanceDate = new Date(row.考勤日期);
      }
      
      if (isNaN(attendanceDate.getTime())) {
        throw new Error('无效日期格式');
      }
    } catch {
      throw new Error(`第${rowNumber}行: 考勤日期格式不正确 "${row.考勤日期}"`);
    }

    // 解析实际打卡时间
    let checkTime: Date | null = null;
    if (row.打卡时间 && String(row.打卡时间).trim() !== '') {
      try {
        if (typeof row.打卡时间 === 'number') {
          // Excel时间序列号
          const timeValue = row.打卡时间 * 24 * 60 * 60 * 1000;
          checkTime = new Date(attendanceDate.getTime() + timeValue);
        } else {
          // 字符串格式，组合日期和时间
          const timeStr = String(row.打卡时间).trim();
          if (timeStr.includes(':')) {
            const [hours, minutes] = timeStr.split(':');
            checkTime = new Date(attendanceDate);
            checkTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          } else {
            checkTime = new Date(`${attendanceDate.toDateString()} ${timeStr}`);
          }
        }

        if (isNaN(checkTime.getTime())) {
          checkTime = null;
        }
      } catch {
        // 忽略打卡时间解析错误，设为null
        checkTime = null;
      }
    }

    // 推断打卡类型（基于时间或设置默认值）
    let attendanceType = AttendanceType.CHECK_IN;
    const attendanceTimeStr = String(row.考勤时间).trim();
    if (attendanceTimeStr.includes('下班') || attendanceTimeStr.includes('18:') || 
        attendanceTimeStr.includes('17:') || attendanceTimeStr.includes('19:')) {
      attendanceType = AttendanceType.CHECK_OUT;
    }

    // 创建打卡记录
    const attendanceRecord = this.attendanceRecordRepository.create({
      employeeId: employee.id,
      attendanceDate,
      attendanceTime: attendanceTimeStr,
      checkTime,
      attendanceType,
      result,
      address: row.打卡地址 ? String(row.打卡地址).trim() || null : null,
      remark: row.打卡备注 ? String(row.打卡备注).trim() || null : null,
      exceptionReason: row.异常打卡原因 ? String(row.异常打卡原因).trim() || null : null,
      device: row.打卡设备 ? String(row.打卡设备).trim() || null : null,
      adminRemark: row.管理员修改备注 ? String(row.管理员修改备注).trim() || null : null,
      isManual: result === AttendanceResult.MANUAL,
    });

    return attendanceRecord;
  }
}
