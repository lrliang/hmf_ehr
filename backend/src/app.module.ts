import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

import { AppController } from './app.controller';
import { AppService } from './app.service';

// 配置模块
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { throttlerConfig } from './config/throttler.config';

// 业务模块
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { LeaveModule } from './modules/leave/leave.module';
import { GoalsModule } from './modules/goals/goals.module';
import { SalaryModule } from './modules/salary/salary.module';
import { ReportsModule } from './modules/reports/reports.module';
import { StoresModule } from './modules/stores/stores.module';
import { PositionsModule } from './modules/positions/positions.module';

// 显式导入实体（解决循环依赖问题）
import { AttendanceDailyReport } from './modules/reports/entities/attendance-daily-report.entity';
import { AttendanceMonthlyReport } from './modules/reports/entities/attendance-monthly-report.entity';

// 共享模块
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    // 配置模块 - 加载环境变量
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, throttlerConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // 数据库模块
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        schema: configService.get('database.schema'),
        entities: [__dirname + '/**/*.entity{.ts,.js}', AttendanceDailyReport, AttendanceMonthlyReport],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: configService.get('database.synchronize'),
        logging: configService.get('database.logging'),
        autoLoadEntities: true,
        retryAttempts: 3,
        retryDelay: 3000,
        keepConnectionAlive: true,
      }),
      inject: [ConfigService],
    }),

    // Redis缓存模块
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore as any,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB', 0),
        ttl: 300, // 默认5分钟过期
      }),
      inject: [ConfigService],
    }),

    // 限流模块
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('throttler.ttl', 60000),
          limit: configService.get('throttler.limit', 10),
        },
      ],
      inject: [ConfigService],
    }),

    // 定时任务模块
    ScheduleModule.forRoot(),

    // 共享模块
    SharedModule,

    // 业务模块
    AuthModule,
    UsersModule,
    EmployeesModule,
    ReportsModule,  // 将ReportsModule移到AttendanceModule之前
    AttendanceModule,
    LeaveModule,
    GoalsModule,
    SalaryModule,
    StoresModule,
    PositionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
