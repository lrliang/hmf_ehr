import request from './request';
import type { LoginRequest, LoginResponse, User } from '@/types';

export const authApi = {
  // 用户登录
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return request.post('/auth/login', data);
  },

  // 用户登出
  logout: (): Promise<void> => {
    return request.post('/auth/logout');
  },

  // 刷新token
  refreshToken: (): Promise<LoginResponse> => {
    return request.post('/auth/refresh');
  },

  // 获取当前用户信息
  getCurrentUser: (): Promise<User> => {
    return request.get('/auth/profile');
  },

  // 修改密码
  changePassword: (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> => {
    return request.post('/auth/change-password', data);
  },

  // 忘记密码
  forgotPassword: (email: string): Promise<void> => {
    return request.post('/auth/forgot-password', { email });
  },

  // 重置密码
  resetPassword: (data: {
    token: string;
    password: string;
    confirmPassword: string;
  }): Promise<void> => {
    return request.post('/auth/reset-password', data);
  },
};
