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

// 考勤打卡类型枚举
export enum AttendanceResult {
  ON_TIME = 'on_time',         // 正常打卡
  LATE = 'late',               // 迟到
  EARLY_LEAVE = 'early_leave', // 早退
  ABSENT = 'absent',           // 缺勤
  OVERTIME = 'overtime',       // 加班
  MANUAL = 'manual',           // 手动补签
}

export enum AttendanceType {
  CHECK_IN = 'check_in',       // 上班打卡
  CHECK_OUT = 'check_out',     // 下班打卡
  BREAK_OUT = 'break_out',     // 外出打卡
  BREAK_IN = 'break_in',       // 回到打卡
}

// 考勤打卡记录类型
export interface AttendanceRecord {
  id: number;
  employeeId: number;
  employee: Employee;
  attendanceDate: string;      // 考勤日期
  attendanceTime: string;      // 考勤时间（应打卡时间）
  checkTime?: string;          // 实际打卡时间
  attendanceType: AttendanceType;
  result: AttendanceResult;
  address?: string;            // 打卡地址
  location?: string;           // 打卡经纬度
  remark?: string;             // 打卡备注
  exceptionReason?: string;    // 异常打卡原因
  device?: string;             // 打卡设备
  deviceInfo?: string;         // 设备信息
  adminRemark?: string;        // 管理员修改备注
  modifiedBy?: number;         // 管理员修改人ID
  modifiedAt?: string;         // 管理员修改时间
  isManual: boolean;           // 是否手动补签
  shift?: string;              // 工作班次
  createdAt: string;
  updatedAt: string;
}

// 查询打卡明细参数
export interface QueryAttendanceRecordParams {
  page: number;
  pageSize: number;
  employeeName?: string;
  employeeId?: number;
  startDate?: string;
  endDate?: string;
  attendanceType?: AttendanceType;
  result?: AttendanceResult;
  storeId?: number;
  positionId?: number;
  isManual?: boolean;
  shift?: string;
}

// 创建打卡记录参数
export interface CreateAttendanceRecordParams {
  employeeId: number;
  attendanceDate: string;
  attendanceTime: string;
  checkTime?: string;
  attendanceType: AttendanceType;
  result: AttendanceResult;
  address?: string;
  location?: string;
  remark?: string;
  exceptionReason?: string;
  device?: string;
  deviceInfo?: string;
  isManual?: boolean;
  shift?: string;
}

// 更新打卡记录参数
export interface UpdateAttendanceRecordParams {
  result?: AttendanceResult;
  exceptionReason?: string;
  adminRemark: string;
}

// 考勤统计类型
export interface AttendanceStatistics {
  total: number;
  on_time: number;
  late: number;
  early_leave: number;
  absent: number;
  overtime: number;
  manual: number;
}

// 导入结果类型
export interface ImportResult {
  success: number;
  failed: number;
  total: number;
  errors?: ImportError[];
  duration?: number;
}

// 导入错误类型
export interface ImportError {
  row: number;
  type: string;
  message: string;
  data?: any;
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
