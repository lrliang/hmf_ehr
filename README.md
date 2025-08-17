# HMF EHR - 县城烘焙连锁店HR数字化人力资源管理系统

一个专为县城烘焙连锁店设计的现代化HR管理系统，提供员工管理、考勤管理、假勤管理、目标管理和薪酬管理等完整功能。

## 🏗️ 系统架构

```
HMF EHR System
├── Frontend (React + TypeScript + Ant Design)
├── Backend (NestJS + TypeScript + PostgreSQL)
├── Database (PostgreSQL + Redis)
└── Reverse Proxy (Nginx)
```

## 🚀 快速开始

### 环境要求

- Docker >= 20.10
- Docker Compose >= 2.0
- Git

### 一键启动

```bash
# 克隆项目
git clone <repository-url>
cd hmf_ehr

# 给脚本执行权限
chmod +x scripts/*.sh

# 启动生产环境
./scripts/start.sh

# 或启动开发环境
./scripts/start.sh dev
```

### 访问系统

#### 生产环境 (默认)
- **前端应用**: http://localhost
- **API文档**: http://localhost/api/v1/docs
- **默认账号**: admin / admin123

#### 开发环境
- **前端应用**: http://localhost:3001 (直连) 或 http://localhost:8090 (Nginx代理)
- **后端API**: http://localhost:8081/api/v1
- **API文档**: http://localhost:8081/api/v1/docs
- **默认账号**: admin / admin123

## 📁 项目结构

```
hmf_ehr/
├── frontend/                   # 前端应用
│   ├── src/
│   │   ├── components/        # 通用组件
│   │   ├── pages/            # 页面组件
│   │   ├── store/            # 状态管理
│   │   ├── services/         # API服务
│   │   └── styles/           # 样式文件
│   ├── Dockerfile            # 生产环境镜像
│   └── Dockerfile.dev        # 开发环境镜像
├── backend/                   # 后端应用
│   ├── src/
│   │   ├── modules/          # 业务模块
│   │   ├── common/           # 通用组件
│   │   ├── config/           # 配置文件
│   │   └── shared/           # 共享模块
│   ├── Dockerfile            # 生产环境镜像
│   └── Dockerfile.dev        # 开发环境镜像
├── nginx/                     # 反向代理配置
│   ├── nginx.conf            # 主配置
│   └── conf.d/               # 站点配置
├── scripts/                   # 管理脚本
│   ├── start.sh              # 启动脚本
│   └── stop.sh               # 停止脚本
├── docs/                      # 项目文档
├── docker-compose.yml         # 生产环境编排
├── docker-compose.dev.yml     # 开发环境编排
└── README.md
```

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Ant Design 5
- **状态管理**: Redux Toolkit
- **路由**: React Router 6
- **样式**: SCSS + CSS Modules
- **图表**: Recharts

### 后端
- **框架**: NestJS + TypeScript
- **数据库**: PostgreSQL + TypeORM
- **缓存**: Redis
- **认证**: JWT + Passport
- **文档**: Swagger/OpenAPI
- **日志**: Winston

### 基础设施
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **SSL**: 自签名证书 (开发) / Let's Encrypt (生产)

## 📊 核心功能

### 👥 员工管理
- 员工信息录入和维护
- 员工档案管理
- 员工状态跟踪
- 员工调动记录
- 技能等级管理

### ⏰ 考勤管理
- 多种打卡方式支持
- 考勤规则配置
- 考勤数据统计
- 异常考勤处理
- 加班时长统计

### 📅 假勤管理
- 多种请假类型
- 请假申请流程
- 请假额度管理
- 审批流程控制
- 请假统计报表

### 🎯 目标管理
- 个人/团队目标设定
- 目标进度跟踪
- 完成情况评估
- 目标调整申请
- 绩效考核支持

### 💰 薪酬管理
- 薪酬结构配置
- 自动薪酬计算
- 薪酬发放管理
- 个税计算
- 薪酬报表生成

### 📈 报表统计
- 实时数据仪表盘
- 多维度统计报表
- 数据可视化图表
- 报表导出功能
- 自定义报表

## 🔧 管理命令

### 启动服务
```bash
# 生产环境
./scripts/start.sh prod

# 开发环境
./scripts/start.sh dev
```

### 停止服务
```bash
# 停止服务
./scripts/stop.sh

# 停止并删除数据
./scripts/stop.sh --remove-volumes
```

### Docker Compose 命令
```bash
# 查看服务状态
docker-compose ps

# 查看服务日志
docker-compose logs -f [service_name]

# 重启特定服务
docker-compose restart [service_name]

# 进入容器
docker-compose exec [service_name] sh

# 查看资源使用
docker-compose top
```

## 🌍 环境配置

### 生产环境端口分配
| 服务 | 端口 | 说明 |
|------|------|------|
| Nginx | 80, 443 | HTTP/HTTPS入口 |
| Backend | 8080 | API服务 |
| PostgreSQL | 5432 | 数据库 |
| Redis | 6379 | 缓存 |

### 开发环境端口分配
| 服务 | 端口 | 说明 |
|------|------|------|
| Frontend | 3001 | React开发服务器 |
| Backend | 8081 | NestJS开发服务器 |
| Nginx | 8090 | 开发环境代理 |
| PostgreSQL | 5433 | 开发数据库 |
| Redis | 6380 | 开发缓存 |
| Node调试 | 9230 | Node.js调试端口 |

**✨ 端口设计说明**: 开发环境和生产环境使用不同端口，可以在同一台服务器上并行运行，互不冲突。

## 📝 开发指南

### 前端开发
```bash
cd frontend
npm install
npm run dev
```

### 后端开发
```bash
cd backend
npm install
npm run start:dev
```

### 数据库迁移
```bash
# 生成迁移文件
npm run migration:generate

# 运行迁移
npm run migration:run

# 回滚迁移
npm run migration:revert
```

## 🔒 安全特性

- JWT Token 认证
- 基于角色的权限控制
- 请求限流保护
- SQL注入防护
- XSS攻击防护
- CSRF保护
- 安全头部配置

## 📊 监控与日志

### 健康检查
- **应用健康**: http://localhost/health
- **Nginx状态**: http://localhost/nginx_status

### 日志文件
- **后端日志**: `./logs/backend/`
- **Nginx日志**: `./logs/nginx/`
- **数据库日志**: Docker容器内

### 性能监控
- 响应时间监控
- 错误率统计
- 资源使用监控
- 数据库性能监控

## 🚀 部署指南

### 生产环境部署

1. **服务器准备**
```bash
# 安装Docker和Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# 克隆项目
git clone <repository-url>
cd hmf_ehr
```

2. **环境配置**
```bash
# 修改环境变量
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env.local

# 配置数据库密码、JWT密钥等
vim backend/.env
```

3. **SSL证书配置**
```bash
# 生产环境建议使用Let's Encrypt
# 或者将证书文件放在nginx/ssl/目录
```

4. **启动服务**
```bash
chmod +x scripts/*.sh
./scripts/start.sh prod
```

### 备份与恢复

```bash
# 数据库备份
docker-compose exec postgres pg_dump -U postgres hmf_ehr > backup.sql

# 数据库恢复
docker-compose exec -T postgres psql -U postgres hmf_ehr < backup.sql
```

## 🐛 故障排除

### 常见问题

1. **端口冲突**
   - 检查80、443、5432、6379端口是否被占用
   - 修改docker-compose.yml中的端口映射

2. **权限问题**
   - 确保Docker有足够权限
   - 检查数据目录权限

3. **内存不足**
   - 确保服务器至少有2GB内存
   - 调整Docker内存限制

4. **网络问题**
   - 检查防火墙设置
   - 确保Docker网络正常

### 日志调试
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs -f backend

# 查看实时日志
tail -f logs/backend/combined.log
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 支持与联系

- **项目文档**: [查看详细文档](./docs/)
- **问题反馈**: [提交Issue](../../issues)
- **技术支持**: [联系我们](mailto:support@example.com)

---

**版本**: 1.0.0  
**最后更新**: 2024年12月  
**维护状态**: 积极维护中