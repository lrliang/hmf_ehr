import request from './request';
import type { User, PaginatedResult, PaginationParams } from '@/types';

export const userApi = {
  // 获取用户列表
  getUsers: (params?: PaginationParams & { keyword?: string }): Promise<PaginatedResult<User>> => {
    return request.get('/users', { params });
  },

  // 获取用户详情
  getUserById: (id: number): Promise<User> => {
    return request.get(`/users/${id}`);
  },

  // 创建用户
  createUser: (data: Partial<User>): Promise<User> => {
    return request.post('/users', data);
  },

  // 更新用户
  updateUser: (id: number, data: Partial<User>): Promise<User> => {
    return request.put(`/users/${id}`, data);
  },

  // 删除用户
  deleteUser: (id: number): Promise<void> => {
    return request.delete(`/users/${id}`);
  },

  // 批量删除用户
  batchDeleteUsers: (ids: number[]): Promise<void> => {
    return request.delete('/users/batch', { data: { ids } });
  },

  // 重置用户密码
  resetUserPassword: (id: number, newPassword: string): Promise<void> => {
    return request.post(`/users/${id}/reset-password`, { newPassword });
  },

  // 启用/禁用用户
  toggleUserStatus: (id: number, status: 'active' | 'inactive'): Promise<User> => {
    return request.patch(`/users/${id}/status`, { status });
  },

  // 分配角色
  assignRoles: (id: number, roles: string[]): Promise<User> => {
    return request.post(`/users/${id}/roles`, { roles });
  },

  // 上传头像
  uploadAvatar: (id: number, file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    return request.post(`/users/${id}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
