# HMF EHR Frontend

县城烘焙连锁店HR数字化人力资源管理系统 - 前端应用

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Ant Design 5
- **状态管理**: Redux Toolkit + Redux Persist
- **路由**: React Router 6
- **样式**: SCSS + CSS Modules
- **图表**: Recharts
- **HTTP客户端**: Axios
- **开发工具**: ESLint + Prettier + Husky

## 项目结构

```
src/
├── components/           # 通用组件
│   ├── Layout/          # 布局组件
│   ├── Loading/         # 加载组件
│   └── AuthRoute/       # 路由守卫
├── pages/               # 页面组件
│   ├── Login/           # 登录页
│   ├── Dashboard/       # 仪表盘
│   ├── UserManagement/  # 用户管理
│   ├── EmployeeManagement/ # 员工管理
│   └── ...
├── store/               # 状态管理
│   ├── slices/         # Redux slices
│   └── hooks.ts        # 类型化hooks
├── services/            # API服务
│   ├── request.ts      # 请求封装
│   ├── auth.ts         # 认证API
│   └── ...
├── types/               # 类型定义
├── utils/               # 工具函数
├── hooks/               # 自定义hooks
├── config/              # 配置文件
├── styles/              # 样式文件
│   ├── variables.scss  # 变量
│   ├── mixins.scss     # 混入
│   └── ...
└── assets/             # 静态资源
```

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 本地开发

1. **安装依赖**
```bash
npm install
```

2. **配置环境变量**
```bash
cp env.example .env.local
# 编辑 .env.local 文件，配置API地址等信息
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问应用**
打开浏览器访问: http://localhost:3000

### 构建部署

1. **构建生产版本**
```bash
npm run build
```

2. **预览构建结果**
```bash
npm run preview
```

3. **Docker 部署**
```bash
# 构建镜像
docker build -t hmf-ehr-frontend .

# 运行容器
docker run -p 80:80 hmf-ehr-frontend
```

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run build:dev` - 构建开发版本
- `npm run preview` - 预览构建结果
- `npm run lint` - 代码检查
- `npm run lint:fix` - 修复代码问题
- `npm run type-check` - 类型检查
- `npm run format` - 格式化代码
- `npm run test` - 运行测试
- `npm run test:ui` - 运行测试UI
- `npm run test:coverage` - 生成测试覆盖率报告

## 功能特性

### 🎨 现代化UI设计
- 基于 Ant Design 5 设计语言
- 响应式布局，支持多设备
- 深色/浅色主题切换
- 丰富的交互动画

### 🔐 完整的认证授权
- JWT Token 认证
- 路由守卫保护
- 角色权限控制
- 自动token刷新

### 📊 数据可视化
- 仪表盘统计图表
- 实时数据更新
- 多种图表类型支持
- 数据导出功能

### 🚀 性能优化
- 代码分割和懒加载
- 图片压缩优化
- 缓存策略
- Bundle分析

### 📱 移动端适配
- 响应式设计
- 触摸友好
- 移动端优化

## 环境变量配置

创建 `.env.local` 文件并配置以下变量：

```bash
# 应用配置
VITE_APP_TITLE=HMF EHR 人力资源管理系统
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=县城烘焙连锁店HR数字化人力资源管理系统

# API配置
VITE_API_BASE_URL=http://localhost:8080
VITE_API_PREFIX=/api/v1

# 功能开关
VITE_ENABLE_MOCK=false
VITE_ENABLE_DEVTOOLS=true

# 主题配置
VITE_THEME_PRIMARY_COLOR=#1890ff
```

## 页面路由

| 路径 | 页面 | 权限要求 |
|------|------|----------|
| `/login` | 登录页 | 无 |
| `/dashboard` | 仪表盘 | 已登录 |
| `/users` | 用户管理 | admin, hr |
| `/employees` | 员工管理 | admin, hr, manager |
| `/attendance` | 考勤管理 | admin, hr, manager |
| `/leave` | 请假管理 | admin, hr, manager |
| `/goals` | 目标管理 | admin, hr, manager |
| `/salary` | 薪酬管理 | admin, hr |
| `/reports` | 报表统计 | admin, hr |
| `/profile` | 个人中心 | 已登录 |

## 状态管理

使用 Redux Toolkit 进行状态管理，主要包含以下模块：

- **auth**: 认证状态管理
- **user**: 用户数据管理
- **employee**: 员工数据管理
- **ui**: UI状态管理

### 使用示例

```typescript
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { loginAsync } from '@/store/slices/authSlice';

const LoginComponent = () => {
  const dispatch = useAppDispatch();
  const { loading, user } = useAppSelector(state => state.auth);
  
  const handleLogin = async (credentials) => {
    await dispatch(loginAsync(credentials));
  };
  
  return (
    // 组件内容
  );
};
```

## API 服务

所有API请求都通过统一的请求封装处理：

```typescript
import { userApi } from '@/services';

// 获取用户列表
const users = await userApi.getUsers({ page: 1, limit: 10 });

// 创建用户
const newUser = await userApi.createUser(userData);
```

## 样式规范

### SCSS变量
项目使用SCSS变量统一管理样式：

```scss
// 颜色
$primary-color: #1890ff;
$success-color: #52c41a;
$warning-color: #faad14;
$error-color: #ff4d4f;

// 间距
$padding-xs: 8px;
$padding-sm: 12px;
$padding-md: 16px;
$padding-lg: 24px;

// 断点
$screen-xs: 480px;
$screen-sm: 576px;
$screen-md: 768px;
$screen-lg: 992px;
```

### 工具类
提供丰富的工具类用于快速样式调整：

```scss
.m-16 { margin: 16px; }
.p-24 { padding: 24px; }
.text-center { text-align: center; }
.d-flex { display: flex; }
```

## 开发规范

### 代码风格
- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 使用 Prettier 格式化代码
- 组件使用 PascalCase 命名
- 文件使用 kebab-case 命名

### 组件开发
```typescript
import React from 'react';
import type { FC } from 'react';

interface Props {
  title: string;
  onClose?: () => void;
}

const MyComponent: FC<Props> = ({ title, onClose }) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onClose}>关闭</button>
    </div>
  );
};

export default MyComponent;
```

### 提交规范
使用语义化提交信息：

- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 样式修改
- `refactor:` 重构代码
- `test:` 测试相关
- `chore:` 构建过程或辅助工具的变动

## 浏览器支持

- Chrome >= 88
- Firefox >= 85
- Safari >= 14
- Edge >= 88

## 部署说明

### Nginx 配置
项目包含了生产环境的Nginx配置，支持：

- SPA路由
- 静态资源缓存
- Gzip压缩
- 安全头设置
- API代理

### Docker 部署
```bash
# 构建镜像
docker build -t hmf-ehr-frontend .

# 运行容器
docker run -d -p 80:80 --name hmf-ehr-frontend hmf-ehr-frontend
```

### CDN 部署
构建后的静态文件可直接部署到CDN：

```bash
npm run build
# 将 dist 目录内容上传到 CDN
```

## 故障排除

### 常见问题

1. **端口占用**
```bash
# 修改端口
npm run dev -- --port 3001
```

2. **依赖安装失败**
```bash
# 清除缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

3. **构建失败**
```bash
# 类型检查
npm run type-check

# 检查ESLint错误
npm run lint
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

---

**版本**: 1.0.0  
**最后更新**: 2024年12月
