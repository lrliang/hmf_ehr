import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import * as compression from 'compression';
import * as helmet from 'helmet';

import { AppModule } from './app.module';
import { winstonConfig } from './config/winston.config';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  // 创建应用实例，使用Winston日志
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // 获取配置服务
  const configService = app.get(ConfigService);
  const port = configService.get('PORT', 8080);
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  const corsOrigin = configService.get('CORS_ORIGIN', 'http://localhost:3000');

  // 设置全局前缀
  app.setGlobalPrefix(apiPrefix);

  // 启用版本控制
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // 启用CORS
  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 安全中间件
  app.use(helmet());
  app.use(compression());

  // 全局管道 - 数据验证和转换
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局过滤器 - 异常处理
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局拦截器
  app.useGlobalInterceptors(new ResponseInterceptor(), new LoggingInterceptor());

  // Swagger API文档配置
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('HMF EHR API')
      .setDescription('烘焙连锁店HR数字化人力资源管理系统 API 文档')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: '输入JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Auth', '认证相关接口')
      .addTag('Users', '用户管理')
      .addTag('Employees', '员工管理')
      .addTag('Attendance', '考勤管理')
      .addTag('Leave', '请假管理')
      .addTag('Goals', '目标管理')
      .addTag('Salary', '薪酬管理')
      .addTag('Reports', '报表统计')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  // 启动应用
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/${apiPrefix}/docs`);
}

bootstrap();
