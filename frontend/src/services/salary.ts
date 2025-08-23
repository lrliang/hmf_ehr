import request from './request';
import type { 
  SalaryDetail, 
  QuerySalaryDetailParams,
  CreateSalaryDetailParams,
  UpdateSalaryDetailParams,
  CalculateSalaryParams,
  BatchCalculateSalaryParams,
  SalaryCalculationResult,
  BatchSalaryCalculationResult,
  SalaryStatistics,
  PaginatedResult
} from '@/types';

export const salaryApi = {
  // 查询工资详情列表（分页）
  getSalaryDetails: (params: QuerySalaryDetailParams): Promise<PaginatedResult<SalaryDetail>> => {
    return request.get('/salary', { params });
  },

  // 获取单个工资详情详情
  getSalaryDetailById: (id: number): Promise<SalaryDetail> => {
    return request.get(`/salary/${id}`);
  },

  // 创建工资详情
  createSalaryDetail: (data: CreateSalaryDetailParams): Promise<SalaryDetail> => {
    return request.post('/salary', data);
  },

  // 更新工资详情
  updateSalaryDetail: (id: number, data: UpdateSalaryDetailParams): Promise<SalaryDetail> => {
    return request.patch(`/salary/${id}`, data);
  },

  // 删除工资详情
  deleteSalaryDetail: (id: number): Promise<{ message: string }> => {
    return request.delete(`/salary/${id}`);
  },

  // 计算员工工资
  calculateSalary: (data: CalculateSalaryParams): Promise<BatchSalaryCalculationResult> => {
    return request.post('/salary/calculate', data);
  },

  // 批量计算多月工资
  batchCalculateSalary: (data: BatchCalculateSalaryParams): Promise<BatchSalaryCalculationResult[]> => {
    return request.post('/salary/batch-calculate', data);
  },

  // 确认工资详情
  confirmSalaryDetail: (id: number, confirmedBy: number): Promise<SalaryDetail> => {
    return request.patch(`/salary/${id}/confirm`, { confirmedBy });
  },

  // 标记工资已发放
  markSalaryAsPaid: (id: number, paidBy: number): Promise<SalaryDetail> => {
    return request.patch(`/salary/${id}/pay`, { paidBy });
  },

  // 获取月度工资统计
  getSalaryStatistics: (reportMonth: string): Promise<{
    success: boolean;
    data: SalaryStatistics;
    message: string;
  }> => {
    return request.get(`/salary/statistics/${reportMonth}`);
  },

  // 导出工资详情数据
  exportSalaryDetails: (params?: QuerySalaryDetailParams): Promise<Blob> => {
    return request.get('/salary/export', { 
      params,
      responseType: 'blob',
    });
  },

  // 批量确认工资详情
  batchConfirmSalaryDetails: (ids: number[], confirmedBy: number): Promise<{
    successCount: number;
    failedCount: number;
    errors: string[];
  }> => {
    return request.post('/salary/batch-confirm', { ids, confirmedBy });
  },

  // 批量标记工资发放
  batchMarkSalaryAsPaid: (ids: number[], paidBy: number): Promise<{
    successCount: number;
    failedCount: number;
    errors: string[];
  }> => {
    return request.post('/salary/batch-pay', { ids, paidBy });
  },

  // 获取工资详情汇总统计
  getSalarySummary: (params: {
    startMonth: string;
    endMonth: string;
    employeeId?: number;
    storeId?: number;
    positionId?: number;
  }): Promise<{
    totalRecords: number;
    totalGrossSalary: number;
    totalNetSalary: number;
    totalSocialInsurance: number;
    totalHousingFund: number;
    totalIncomeTax: number;
    byMonth: Array<{
      month: string;
      grossSalary: number;
      netSalary: number;
      employeeCount: number;
    }>;
    byEmployee: Array<{
      employeeId: number;
      employeeName: string;
      totalGrossSalary: number;
      totalNetSalary: number;
      recordCount: number;
    }>;
  }> => {
    return request.get('/salary/summary', { params });
  },

  // 取消工资详情
  cancelSalaryDetail: (id: number, reason?: string): Promise<SalaryDetail> => {
    return request.patch(`/salary/${id}/cancel`, { reason });
  },

  // 重新计算指定工资详情
  recalculateSalaryDetail: (id: number): Promise<SalaryDetail> => {
    return request.post(`/salary/${id}/recalculate`);
  }
};
