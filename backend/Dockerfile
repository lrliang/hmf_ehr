# 多阶段构建
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:18-alpine AS builder

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production && npm cache clean --force

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产环境镜像
FROM swr.cn-north-4.myhuaweicloud.com/ddn-k8s/docker.io/node:18-alpine AS production

# 创建应用目录
WORKDIR /app

# 安装dumb-init用于信号处理
RUN apk add --no-cache dumb-init

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 复制package文件
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 从builder阶段复制构建产物
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# 创建日志目录
RUN mkdir -p logs && chown -R nestjs:nodejs logs

# 创建上传目录
RUN mkdir -p uploads && chown -R nestjs:nodejs uploads

# 切换到非root用户
USER nestjs

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# 启动应用
CMD ["dumb-init", "node", "dist/main"]
