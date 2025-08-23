import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalaryService } from './salary.service';
import { SalaryController } from './salary.controller';
import { SalaryDetail } from './entities/salary-detail.entity';
import { Employee } from '../employees/entities/employee.entity';
import { AttendanceMonthlyReport } from '../reports/entities/attendance-monthly-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalaryDetail,
      Employee,
      AttendanceMonthlyReport
    ])
  ],
  controllers: [SalaryController],
  providers: [SalaryService],
  exports: [SalaryService],
})
export class SalaryModule {}
