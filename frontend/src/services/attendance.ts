import request from './request';
import type { 
  AttendanceRecord, 
  QueryAttendanceRecordParams,
  CreateAttendanceRecordParams,
  UpdateAttendanceRecordParams,
  AttendanceStatistics,
  PaginatedResult,
  ImportResult 
} from '@/types';

export const attendanceApi = {
  // 查询打卡明细列表（分页）
  getAttendanceRecords: (params: QueryAttendanceRecordParams): Promise<PaginatedResult<AttendanceRecord>> => {
    return request.get('/attendance/records', { params });
  },

  // 获取单个打卡记录详情
  getAttendanceRecordById: (id: number): Promise<AttendanceRecord> => {
    return request.get(`/attendance/records/${id}`);
  },

  // 创建打卡记录
  createAttendanceRecord: (data: CreateAttendanceRecordParams): Promise<AttendanceRecord> => {
    return request.post('/attendance/records', data);
  },

  // 管理员修改打卡记录
  updateAttendanceRecord: (id: number, data: UpdateAttendanceRecordParams): Promise<AttendanceRecord> => {
    return request.patch(`/attendance/records/${id}`, data);
  },

  // 删除打卡记录
  deleteAttendanceRecord: (id: number): Promise<{ message: string }> => {
    return request.delete(`/attendance/records/${id}`);
  },

  // 获取员工考勤统计
  getAttendanceStatistics: (employeeId: number, startDate: string, endDate: string): Promise<AttendanceStatistics> => {
    return request.get(`/attendance/statistics/${employeeId}`, {
      params: { startDate, endDate }
    });
  },

  // 获取我的打卡记录
  getMyAttendanceRecords: (params?: {
    page?: number;
    pageSize?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResult<AttendanceRecord>> => {
    return request.get('/attendance/my-records', { params });
  },

  // 批量删除打卡记录
  batchDeleteAttendanceRecords: (ids: number[]): Promise<{ message: string }> => {
    return request.delete('/attendance/records/batch', { data: { ids } });
  },

  // 导出打卡明细数据
  exportAttendanceRecords: (params?: QueryAttendanceRecordParams): Promise<Blob> => {
    return request.get('/attendance/records/export', { 
      params,
      responseType: 'blob',
    });
  },



  // 获取考勤汇总数据（按日期范围）
  getAttendanceSummary: (params: {
    startDate: string;
    endDate: string;
    employeeId?: number;
    storeId?: number;
    positionId?: number;
  }): Promise<{
    totalRecords: number;
    normalCount: number;
    lateCount: number;
    earlyLeaveCount: number;
    absentCount: number;
    overtimeCount: number;
    manualCount: number;
    byDate: Array<{
      date: string;
      normal: number;
      late: number;
      earlyLeave: number;
      absent: number;
      overtime: number;
    }>;
    byEmployee: Array<{
      employeeId: number;
      employeeName: string;
      normal: number;
      late: number;
      earlyLeave: number;
      absent: number;
      overtime: number;
    }>;
  }> => {
    return request.get('/attendance/summary', { params });
  },

  // 补签申请
  applyForMakeup: (data: {
    employeeId: number;
    attendanceDate: string;
    attendanceTime: string;
    attendanceType: string;
    reason: string;
  }): Promise<{ message: string }> => {
    return request.post('/attendance/makeup-application', data);
  },

  // 批量创建考勤计划
  createAttendanceSchedule: (data: {
    employeeIds: number[];
    startDate: string;
    endDate: string;
    checkInTime: string;
    checkOutTime: string;
    workDays: number[]; // 1-7 表示周一到周日
    shift?: string;
  }): Promise<{ message: string; count: number }> => {
    return request.post('/attendance/schedule', data);
  },

  // 获取异常考勤记录
  getAbnormalAttendanceRecords: (params: {
    page: number;
    pageSize: number;
    startDate?: string;
    endDate?: string;
    employeeId?: number;
    storeId?: number;
  }): Promise<PaginatedResult<AttendanceRecord>> => {
    return request.get('/attendance/abnormal-records', { params });
  },

  // 导入Excel打卡明细数据
  importAttendanceRecords: (file: File): Promise<ImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post('/attendance/records/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
