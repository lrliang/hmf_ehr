import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AttendanceDailyReport, AttendanceMonthlyReport } from './entities';
import { AttendanceRecord } from '../attendance/entities/attendance-record.entity';
import { Employee } from '../employees/entities/employee.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AttendanceDailyReport,
      AttendanceMonthlyReport,
      AttendanceRecord,
      Employee,
    ])
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
