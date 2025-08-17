#!/bin/bash

# HMF EHR 项目停止脚本

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

# 停止服务
stop_services() {
    local env=${1:-prod}
    local remove_volumes=${2:-false}
    
    log_info "停止 $env 环境服务..."
    
    if [ "$env" = "dev" ]; then
        if [ "$remove_volumes" = "true" ]; then
            docker-compose -f docker-compose.dev.yml down -v
            log_warning "已删除开发环境数据卷"
        else
            docker-compose -f docker-compose.dev.yml down
        fi
    else
        if [ "$remove_volumes" = "true" ]; then
            docker-compose down -v
            log_warning "已删除生产环境数据卷"
        else
            docker-compose down
        fi
    fi
    
    log_success "服务停止完成"
}

# 清理资源
cleanup_resources() {
    log_info "清理Docker资源..."
    
    # 清理未使用的镜像
    docker image prune -f
    
    # 清理未使用的网络
    docker network prune -f
    
    # 清理未使用的卷（谨慎使用）
    # docker volume prune -f
    
    log_success "资源清理完成"
}

# 显示状态
show_status() {
    echo ""
    log_info "=== 当前Docker状态 ==="
    echo ""
    
    echo "🐳 运行中的容器:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo ""
    echo "💾 数据卷:"
    docker volume ls --format "table {{.Driver}}\t{{.Name}}"
    
    echo ""
    echo "🌐 网络:"
    docker network ls --format "table {{.Driver}}\t{{.Name}}\t{{.Scope}}"
}

# 主函数
main() {
    local env=${1:-prod}
    local remove_volumes=${2:-false}
    
    echo "🛑 停止 HMF EHR 系统 ($env 环境)"
    echo ""
    
    stop_services "$env" "$remove_volumes"
    
    if [ "$remove_volumes" != "true" ]; then
        cleanup_resources
    fi
    
    show_status
    
    echo ""
    log_success "HMF EHR 系统已停止"
}

# 帮助信息
show_help() {
    echo "HMF EHR 项目停止脚本"
    echo ""
    echo "用法:"
    echo "  $0 [环境] [选项]"
    echo ""
    echo "环境选项:"
    echo "  prod    生产环境 (默认)"
    echo "  dev     开发环境"
    echo ""
    echo "选项:"
    echo "  --remove-volumes    同时删除数据卷 (⚠️  会删除数据库数据)"
    echo "  --cleanup          清理Docker资源"
    echo ""
    echo "示例:"
    echo "  $0                    # 停止生产环境"
    echo "  $0 dev                # 停止开发环境"
    echo "  $0 prod --remove-volumes  # 停止生产环境并删除数据"
    echo ""
}

# 脚本入口
case "${1:-}" in
    -h|--help|help)
        show_help
        exit 0
        ;;
    dev|development)
        if [ "$2" = "--remove-volumes" ]; then
            main "dev" "true"
        else
            main "dev" "false"
        fi
        ;;
    prod|production|"")
        if [ "$2" = "--remove-volumes" ]; then
            main "prod" "true"
        else
            main "prod" "false"
        fi
        ;;
    --remove-volumes)
        main "prod" "true"
        ;;
    *)
        log_error "未知的参数: $1"
        show_help
        exit 1
        ;;
esac
