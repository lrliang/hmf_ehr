// 通用类型定义

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

// 分页参数
export interface PaginationParams {
  page?: number;
  limit?: number;
}

// 分页结果
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  realName: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  roles: ('admin' | 'hr' | 'manager' | 'employee')[];
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt: string;
}

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  access_token: string;
  user: Pick<User, 'id' | 'username' | 'email' | 'realName' | 'roles'>;
}

// 员工相关类型
export interface Employee {
  id: number;
  employeeNo: string;
  name: string;
  idCard: string;
  phone?: string;
  email?: string;
  gender?: 'male' | 'female';
  birthDate?: string;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  photoUrl?: string;
  status: 'active' | 'probation' | 'resigned' | 'suspended';
  storeId?: number;
  positionId?: number;
  hireDate?: string;
  baseSalary?: number;
  skillLevel?: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

// 门店类型
export interface Store {
  id: number;
  storeName: string;
  address?: string;
  phone?: string;
  managerId?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 职位类型
export interface Position {
  id: number;
  positionName: string;
  description?: string;
  baseSalary?: number;
  level?: number;
  createdAt: string;
  updatedAt: string;
}

// 考勤记录类型
export interface AttendanceRecord {
  id: number;
  employeeId: number;
  storeId: number;
  checkInTime?: string;
  checkOutTime?: string;
  checkInLocation?: string;
  checkOutLocation?: string;
  status: 'normal' | 'late' | 'early_leave' | 'absent' | 'overtime';
  workHours?: number;
  overtimeHours?: number;
  createdDate: string;
  createdAt: string;
}

// 请假申请类型
export interface LeaveApplication {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  totalDays: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approverId?: number;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 目标类型
export interface Goal {
  id: number;
  employeeId: number;
  goalTypeId: number;
  goalName: string;
  targetValue?: number;
  currentValue: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  completionRate: number;
  createdAt: string;
  updatedAt: string;
}

// 薪酬记录类型
export interface SalaryRecord {
  id: number;
  employeeId: number;
  year: number;
  month: number;
  baseSalary: number;
  positionSalary?: number;
  performanceSalary?: number;
  overtimeSalary?: number;
  allowance?: number;
  deduction?: number;
  tax?: number;
  netSalary: number;
  status: 'calculated' | 'confirmed' | 'paid';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 表格列配置
export interface TableColumn {
  key: string;
  title: string;
  dataIndex?: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  sorter?: boolean;
  render?: (value: any, record: any, index: number) => React.ReactNode;
}

// 表单字段配置
export interface FormField {
  name: string;
  label: string;
  type: 'input' | 'select' | 'date' | 'textarea' | 'number' | 'password' | 'upload';
  required?: boolean;
  rules?: any[];
  options?: { label: string; value: any }[];
  placeholder?: string;
  disabled?: boolean;
}

// 菜单项类型
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  permission?: string[];
}

// 面包屑类型
export interface BreadcrumbItem {
  title: string;
  path?: string;
}

// 统计数据类型
export interface StatData {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
  trend?: {
    type: 'up' | 'down';
    value: number;
  };
}

// 图表数据类型
export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

// 上传文件类型
export interface UploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error' | 'removed';
  url?: string;
  response?: any;
  error?: any;
}

// 通知类型
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// 权限类型
export type Permission = 
  | 'user:view' | 'user:create' | 'user:update' | 'user:delete'
  | 'employee:view' | 'employee:create' | 'employee:update' | 'employee:delete'
  | 'attendance:view' | 'attendance:create' | 'attendance:update' | 'attendance:delete'
  | 'leave:view' | 'leave:create' | 'leave:update' | 'leave:approve'
  | 'goal:view' | 'goal:create' | 'goal:update' | 'goal:delete'
  | 'salary:view' | 'salary:create' | 'salary:update' | 'salary:delete'
  | 'report:view' | 'report:export';

// 环境变量类型
export interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_DESCRIPTION: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_PREFIX: string;
  readonly VITE_UPLOAD_MAX_SIZE: string;
  readonly VITE_UPLOAD_ACCEPT_TYPES: string;
  readonly VITE_ENABLE_MOCK: string;
  readonly VITE_ENABLE_DEVTOOLS: string;
  readonly VITE_THEME_PRIMARY_COLOR: string;
  readonly VITE_THEME_SUCCESS_COLOR: string;
  readonly VITE_THEME_WARNING_COLOR: string;
  readonly VITE_THEME_ERROR_COLOR: string;
}

export interface ImportMeta {
  readonly env: ImportMetaEnv;
}
