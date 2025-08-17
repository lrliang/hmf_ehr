# HMF EHR Backend

县城烘焙连锁店HR数字化人力资源管理系统 - 后端服务

## 技术栈

- **框架**: NestJS + TypeScript
- **数据库**: PostgreSQL + TypeORM
- **缓存**: Redis
- **认证**: JWT + Passport
- **文档**: Swagger/OpenAPI
- **容器化**: Docker + Docker Compose

## 项目结构

```
src/
├── common/                 # 通用模块
│   ├── decorators/        # 装饰器
│   ├── dto/              # 通用DTO
│   ├── entities/         # 基础实体
│   ├── filters/          # 异常过滤器
│   └── interceptors/     # 拦截器
├── config/               # 配置文件
├── modules/              # 业务模块
│   ├── auth/            # 认证模块
│   ├── users/           # 用户管理
│   ├── employees/       # 员工管理
│   ├── attendance/      # 考勤管理
│   ├── leave/           # 请假管理
│   ├── goals/           # 目标管理
│   ├── salary/          # 薪酬管理
│   ├── reports/         # 报表统计
│   ├── stores/          # 门店管理
│   └── positions/       # 职位管理
├── shared/              # 共享模块
├── app.module.ts        # 根模块
└── main.ts             # 应用入口
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- PostgreSQL >= 12.0
- Redis >= 6.0
- Docker & Docker Compose (可选)

### 本地开发

1. **安装依赖**
```bash
npm install
```

2. **配置环境变量**
```bash
cp env.example .env
# 编辑 .env 文件，配置数据库连接等信息
```

3. **启动数据库服务**
```bash
# 使用 Docker Compose 启动数据库
docker-compose up -d postgres redis
```

4. **运行数据库迁移**
```bash
npm run migration:run
```

5. **启动开发服务**
```bash
npm run start:dev
```

6. **访问API文档**
打开浏览器访问: http://localhost:8080/api/v1/docs

### Docker 部署

1. **构建并启动所有服务**
```bash
docker-compose up -d
```

2. **查看服务状态**
```bash
docker-compose ps
```

3. **查看日志**
```bash
docker-compose logs -f backend
```

## 可用脚本

- `npm run start` - 启动生产环境
- `npm run start:dev` - 启动开发环境（热重载）
- `npm run start:debug` - 启动调试模式
- `npm run build` - 构建项目
- `npm run lint` - 代码检查
- `npm run format` - 代码格式化
- `npm run test` - 运行测试
- `npm run test:watch` - 监视模式运行测试
- `npm run test:cov` - 运行测试并生成覆盖率报告

## 数据库操作

- `npm run migration:generate` - 生成迁移文件
- `npm run migration:run` - 运行迁移
- `npm run migration:revert` - 回滚迁移
- `npm run schema:sync` - 同步数据库结构（开发环境）

## API 文档

项目集成了 Swagger，启动服务后可访问：
- 开发环境: http://localhost:8080/api/v1/docs
- 生产环境: 请根据实际域名访问

## 认证授权

系统采用 JWT 认证方式，支持以下角色：

- `admin` - 系统管理员
- `hr` - HR管理员  
- `manager` - 店长
- `employee` - 员工

### 使用方式

1. 登录获取 token:
```bash
POST /api/v1/auth/login
{
  "username": "admin",
  "password": "admin123"
}
```

2. 在请求头中添加认证信息:
```
Authorization: Bearer <your-jwt-token>
```

## 环境变量配置

主要环境变量说明：

```bash
# 应用配置
NODE_ENV=development
PORT=8080
API_PREFIX=api/v1

# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=hmf_ehr

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT配置
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
```

## 日志管理

系统使用 Winston 进行日志管理：

- 控制台输出：开发环境彩色日志
- 文件输出：
  - `logs/error.log` - 错误日志
  - `logs/combined.log` - 综合日志

## 性能优化

1. **数据库优化**
   - 使用连接池
   - 合理设置索引
   - 分页查询

2. **缓存策略**
   - Redis 缓存热点数据
   - 查询结果缓存

3. **安全措施**
   - 请求限流
   - 参数验证
   - SQL注入防护
   - XSS防护

## 监控与健康检查

- 健康检查端点: `GET /api/v1/health`
- 应用指标: 内存使用、运行时间等
- Docker 健康检查: 自动重启异常容器

## 开发规范

1. **代码风格**
   - 使用 ESLint + Prettier
   - 遵循 TypeScript 最佳实践

2. **提交规范**
   - 使用语义化提交信息
   - 代码提交前进行 lint 检查

3. **测试要求**
   - 单元测试覆盖率 > 80%
   - 集成测试覆盖主要业务流程

## 部署说明

### 生产环境部署

1. **环境准备**
```bash
# 安装 Docker 和 Docker Compose
# 配置生产环境变量
# 准备 SSL 证书
```

2. **部署步骤**
```bash
# 拉取代码
git clone <repository-url>
cd hmf_ehr/backend

# 配置环境变量
cp env.example .env
# 编辑生产环境配置

# 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 运行数据库迁移
docker-compose exec backend npm run migration:run
```

3. **监控检查**
```bash
# 检查服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 健康检查
curl http://localhost/api/v1/health
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库服务是否启动
   - 验证连接参数配置
   - 检查网络连通性

2. **Redis 连接失败**
   - 检查 Redis 服务状态
   - 验证连接配置

3. **端口冲突**
   - 修改 docker-compose.yml 中的端口映射
   - 检查本地端口占用情况

### 日志查看

```bash
# 查看应用日志
docker-compose logs backend

# 查看数据库日志  
docker-compose logs postgres

# 实时查看日志
docker-compose logs -f backend
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目负责人: [您的姓名]
- 邮箱: [您的邮箱]
- 项目地址: [项目仓库地址]

---

**版本**: 1.0.0  
**最后更新**: 2024年12月
