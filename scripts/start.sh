#!/bin/bash

# HMF EHR 项目启动脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi
    
    log_success "Docker 环境检查通过"
}

# 创建必要的目录
create_directories() {
    log_info "创建必要的目录..."
    
    mkdir -p data/postgres
    mkdir -p data/redis
    mkdir -p logs/backend
    mkdir -p logs/nginx
    mkdir -p uploads
    mkdir -p nginx/ssl
    
    log_success "目录创建完成"
}

# 设置权限
set_permissions() {
    log_info "设置目录权限..."
    
    # 设置日志目录权限
    chmod -R 755 logs/
    chmod -R 755 uploads/
    chmod -R 755 data/
    
    log_success "权限设置完成"
}

# 生成SSL证书（自签名）
generate_ssl() {
    if [ ! -f "nginx/ssl/cert.pem" ]; then
        log_info "生成自签名SSL证书..."
        
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/key.pem \
            -out nginx/ssl/cert.pem \
            -subj "/C=CN/ST=State/L=City/O=Organization/CN=localhost"
        
        log_success "SSL证书生成完成"
    else
        log_info "SSL证书已存在，跳过生成"
    fi
}

# 启动服务
start_services() {
    local env=${1:-prod}
    
    log_info "启动 $env 环境服务..."
    
    if [ "$env" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml up -d
    else
        docker-compose up -d
    fi
    
    log_success "服务启动完成"
}

# 检查服务状态
check_services() {
    log_info "检查服务状态..."
    
    # 等待服务启动
    sleep 10
    
    # 检查各个服务
    services=("postgres" "redis" "backend" "frontend" "nginx")
    
    for service in "${services[@]}"; do
        if docker-compose ps | grep -q "${service}.*Up"; then
            log_success "$service 服务运行正常"
        else
            log_error "$service 服务启动失败"
        fi
    done
}

# 显示访问信息
show_access_info() {
    local env=${1:-prod}
    
    echo ""
    log_success "=== HMF EHR 系统启动完成 ($env 环境) ==="
    echo ""
    
    if [ "$env" = "dev" ]; then
        echo "🌐 开发环境访问地址:"
        echo "   前端直连:    http://localhost:3001"
        echo "   后端直连:    http://localhost:8081"
        echo "   Nginx代理:   http://localhost:8090"
        echo ""
        echo "🔧 开发环境API:"
        echo "   API直连:     http://localhost:8081/api/v1"
        echo "   API代理:     http://localhost:8090/api/v1"
        echo "   API文档:     http://localhost:8081/api/v1/docs"
        echo ""
        echo "💾 开发数据库连接:"
        echo "   Host:        localhost"
        echo "   Port:        5433"
        echo "   Database:    hmf_ehr_dev"
        echo "   Username:    postgres"
        echo "   Password:    password"
        echo ""
        echo "🔄 开发Redis连接:"
        echo "   Host:        localhost"
        echo "   Port:        6380"
        echo ""
        echo "🐛 调试端口:"
        echo "   Node调试:    9230"
        echo ""
        echo "📊 开发监控:"
        echo "   健康检查:    http://localhost:8090/dev-health"
        echo ""
        echo "🛠  开发管理命令:"
        echo "   查看状态: docker-compose -f docker-compose.dev.yml ps"
        echo "   查看日志: docker-compose -f docker-compose.dev.yml logs -f [service]"
        echo "   停止服务: ./scripts/stop.sh dev"
        echo "   重启服务: docker-compose -f docker-compose.dev.yml restart [service]"
    else
        echo "🌐 生产环境访问地址:"
        echo "   HTTP:        http://localhost"
        echo "   HTTPS:       https://localhost"
        echo ""
        echo "🔧 生产环境API:"
        echo "   API:         http://localhost/api/v1"
        echo "   文档:        http://localhost/api/v1/docs"
        echo ""
        echo "💾 生产数据库连接:"
        echo "   Host:        localhost"
        echo "   Port:        5432"
        echo "   Database:    hmf_ehr"
        echo "   Username:    postgres"
        echo "   Password:    password"
        echo ""
        echo "🔄 生产Redis连接:"
        echo "   Host:        localhost"
        echo "   Port:        6379"
        echo ""
        echo "📊 生产监控:"
        echo "   Nginx状态:   http://localhost/nginx_status"
        echo "   健康检查:    http://localhost/health"
        echo ""
        echo "🛠  生产管理命令:"
        echo "   查看状态: docker-compose ps"
        echo "   查看日志: docker-compose logs -f [service]"
        echo "   停止服务: ./scripts/stop.sh"
        echo "   重启服务: docker-compose restart [service]"
    fi
    
    echo ""
    echo "📝 日志目录:"
    echo "   后端日志: ./logs/backend/"
    echo "   Nginx日志: ./logs/nginx/"
    echo ""
}

# 主函数
main() {
    local env=${1:-prod}
    
    echo "🚀 启动 HMF EHR 系统 ($env 环境)"
    echo ""
    
    check_docker
    create_directories
    set_permissions
    
    if [ "$env" = "prod" ]; then
        generate_ssl
    fi
    
    start_services "$env"
    check_services
    show_access_info "$env"
}

# 帮助信息
show_help() {
    echo "HMF EHR 项目启动脚本"
    echo ""
    echo "用法:"
    echo "  $0 [环境]"
    echo ""
    echo "环境选项:"
    echo "  prod    生产环境 (默认)"
    echo "  dev     开发环境"
    echo ""
    echo "示例:"
    echo "  $0          # 启动生产环境"
    echo "  $0 prod     # 启动生产环境"
    echo "  $0 dev      # 启动开发环境"
    echo ""
}

# 脚本入口
case "${1:-}" in
    -h|--help|help)
        show_help
        exit 0
        ;;
    dev|development)
        main "dev"
        ;;
    prod|production|"")
        main "prod"
        ;;
    *)
        log_error "未知的环境参数: $1"
        show_help
        exit 1
        ;;
esac
