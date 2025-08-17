import request from './request';
import type { Employee, PaginatedResult, PaginationParams } from '@/types';

export const employeeApi = {
  // 获取员工列表
  getEmployees: (params?: PaginationParams & { 
    keyword?: string; 
    status?: string; 
    storeId?: number; 
    positionId?: number; 
  }): Promise<PaginatedResult<Employee>> => {
    return request.get('/employees', { params });
  },

  // 获取员工详情
  getEmployeeById: (id: number): Promise<Employee> => {
    return request.get(`/employees/${id}`);
  },

  // 根据员工编号获取员工
  getEmployeeByNo: (employeeNo: string): Promise<Employee> => {
    return request.get(`/employees/by-no/${employeeNo}`);
  },

  // 创建员工
  createEmployee: (data: Partial<Employee>): Promise<Employee> => {
    return request.post('/employees', data);
  },

  // 更新员工
  updateEmployee: (id: number, data: Partial<Employee>): Promise<Employee> => {
    return request.put(`/employees/${id}`, data);
  },

  // 删除员工
  deleteEmployee: (id: number): Promise<void> => {
    return request.delete(`/employees/${id}`);
  },

  // 批量删除员工
  batchDeleteEmployees: (ids: number[]): Promise<void> => {
    return request.delete('/employees/batch', { data: { ids } });
  },

  // 更新员工状态
  updateEmployeeStatus: (id: number, status: Employee['status']): Promise<Employee> => {
    return request.patch(`/employees/${id}/status`, { status });
  },

  // 员工调动
  transferEmployee: (id: number, data: {
    storeId: number;
    positionId?: number;
    reason?: string;
  }): Promise<Employee> => {
    return request.post(`/employees/${id}/transfer`, data);
  },

  // 上传员工照片
  uploadPhoto: (id: number, file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('photo', file);
    return request.post(`/employees/${id}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 导出员工数据
  exportEmployees: (params?: any): Promise<Blob> => {
    return request.get('/employees/export', { 
      params,
      responseType: 'blob',
    });
  },

  // 导入员工数据
  importEmployees: (file: File): Promise<{
    success: number;
    failed: number;
    errors?: Array<{ row: number; message: string }>;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post('/employees/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // 获取员工统计信息
  getEmployeeStats: (): Promise<{
    total: number;
    active: number;
    probation: number;
    resigned: number;
    byStore: Array<{ storeId: number; storeName: string; count: number }>;
    byPosition: Array<{ positionId: number; positionName: string; count: number }>;
  }> => {
    return request.get('/employees/stats');
  },
};
