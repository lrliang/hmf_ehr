import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';
import type { ApiResponse } from '@/types';

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + import.meta.env.VITE_API_PREFIX,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 添加认证token - 使用动态导入避免循环依赖
    try {
      const persistedState = localStorage.getItem('persist:hmf-ehr-root');
      if (persistedState) {
        const parsedState = JSON.parse(persistedState);
        const authState = JSON.parse(parsedState.auth);
        const token = authState.token;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.warn('Failed to get token from localStorage:', error);
    }
    
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response;
    
    // 检查业务状态码
    if (data.success === false) {
      message.error(data.message || '请求失败');
      return Promise.reject(new Error(data.message || '请求失败'));
    }
    
    return data.data;
  },
  (error: AxiosError<ApiResponse>) => {
    const { response, code, message: errorMessage } = error;
    
    // 网络错误
    if (code === 'ECONNABORTED' || errorMessage.includes('timeout')) {
      message.error('请求超时，请稍后重试');
      return Promise.reject(error);
    }
    
    if (code === 'ERR_NETWORK') {
      message.error('网络连接失败，请检查网络');
      return Promise.reject(error);
    }
    
    // HTTP状态码错误处理
    if (response) {
      const { status, data } = response;
      const errorMsg = data?.message || getErrorMessage(status);
      
      switch (status) {
        case 401:
          // 未授权，清除token并跳转登录
          message.error('登录已过期，请重新登录');
          // 使用动态导入避免循环依赖
          import('@/store').then(({ store }) => {
            import('@/store/slices/authSlice').then(({ logoutAsync }) => {
              store.dispatch(logoutAsync());
            });
          });
          window.location.href = '/login';
          break;
          
        case 403:
          message.error('没有权限访问该资源');
          break;
          
        case 404:
          message.error('请求的资源不存在');
          break;
          
        case 500:
          message.error('服务器内部错误');
          break;
          
        case 502:
          message.error('网关错误');
          break;
          
        case 503:
          message.error('服务不可用');
          break;
          
        default:
          message.error(errorMsg);
      }
    } else {
      message.error('网络异常，请稍后重试');
    }
    
    return Promise.reject(error);
  }
);

// 获取错误信息
function getErrorMessage(status: number): string {
  const errorMap: Record<number, string> = {
    400: '请求参数错误',
    401: '未授权访问',
    403: '禁止访问',
    404: '资源不存在',
    405: '请求方法不允许',
    408: '请求超时',
    422: '请求参数验证失败',
    429: '请求过于频繁',
    500: '服务器内部错误',
    501: '服务未实现',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时',
  };
  
  return errorMap[status] || `请求失败 (${status})`;
}

// 取消请求的工具函数
export const createCancelToken = () => axios.CancelToken.source();

// 检查是否为取消请求的错误
export const isCancel = (error: unknown) => axios.isCancel(error);

// 导出配置好的请求实例
export default request;
