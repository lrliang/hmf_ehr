import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Typography, 
  Table, 
  Form, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Row, 
  Col,
  Statistic,
  Progress,
  Tag,
  message,
  Tooltip,
  Empty,
  Spin
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  ExportOutlined,
  CalendarOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { attendanceApi } from '@/services';
import type { 
  AttendanceMonthlyReport, 
  QueryMonthlyReportParams
} from '@/types';
import { MonthlyReportStatus } from '@/types';

const { Title } = Typography;
const { MonthPicker } = DatePicker;
const { Option } = Select;

// 统计信息接口
interface MonthlyStatistics {
  totalEmployees: number;
  averageAttendanceRate: number;
  totalAbsentDays: number;
  totalOvertimeHours: number;
  totalLateMinutes: number;
  totalEarlyLeaveMinutes: number;
}

// 获取状态颜色
const getStatusColor = (status: MonthlyReportStatus) => {
  switch (status) {
    case MonthlyReportStatus.DRAFT:
      return 'default';
    case MonthlyReportStatus.PENDING:
      return 'processing';
    case MonthlyReportStatus.CONFIRMED:
      return 'success';
    case MonthlyReportStatus.REJECTED:
      return 'error';
    case MonthlyReportStatus.LOCKED:
      return 'warning';
    default:
      return 'default';
  }
};

// 获取状态文本
const getStatusText = (status: MonthlyReportStatus) => {
  switch (status) {
    case MonthlyReportStatus.DRAFT:
      return '草稿';
    case MonthlyReportStatus.PENDING:
      return '待确认';
    case MonthlyReportStatus.CONFIRMED:
      return '已确认';
    case MonthlyReportStatus.REJECTED:
      return '已拒绝';
    case MonthlyReportStatus.LOCKED:
      return '已锁定';
    default:
      return status;
  }
};

const AttendanceMonthlyReport: React.FC = () => {
  const [form] = Form.useForm();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AttendanceMonthlyReport[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  });
  const [statistics, setStatistics] = useState<MonthlyStatistics>({
    totalEmployees: 0,
    averageAttendanceRate: 0,
    totalAbsentDays: 0,
    totalOvertimeHours: 0,
    totalLateMinutes: 0,
    totalEarlyLeaveMinutes: 0,
  });

  // 搜索参数
  const [searchParams, setSearchParams] = useState<QueryMonthlyReportParams>({
    page: 1,
    pageSize: 20,
    reportMonth: dayjs().subtract(1, 'month').format('YYYY-MM'),
  });

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 调用真实API获取月报数据
      const result = await attendanceApi.getMonthlyReports(searchParams);
      setData(result.data);
      
      // 更新分页信息
      setPagination({
        page: result.page,
        pageSize: result.limit,
        total: result.total,
      });
      
      // 计算统计数据
      const stats = result.data.reduce((acc, record) => {
        acc.totalEmployees++;
        // 计算出勤率
        const attendanceRate = record.expectedWorkingDays > 0 
          ? Math.round((record.actualWorkingDays / record.expectedWorkingDays) * 100) 
          : 0;
        acc.averageAttendanceRate += attendanceRate;
        acc.totalAbsentDays += record.absentDays;
        acc.totalOvertimeHours += (record.weekendOvertimeHours + record.legalHolidayOvertimeHours);
        acc.totalLateMinutes += record.totalLateMinutes;
        acc.totalEarlyLeaveMinutes += record.totalEarlyLeaveMinutes;
        return acc;
      }, {
        totalEmployees: 0,
        averageAttendanceRate: 0,
        totalAbsentDays: 0,
        totalOvertimeHours: 0,
        totalLateMinutes: 0,
        totalEarlyLeaveMinutes: 0,
      });

      if (stats.totalEmployees > 0) {
        stats.averageAttendanceRate = Math.round(stats.averageAttendanceRate / stats.totalEmployees);
      }

      setStatistics(stats);
    } catch (error) {
      console.error('获取考勤月报失败:', error);
      message.error('获取考勤月报失败');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 搜索处理
  const handleSearch = (values: Record<string, unknown>) => {
    const params: QueryMonthlyReportParams = {
      page: 1, // 搜索时重置到第一页
      pageSize: searchParams.pageSize,
    };

    // 处理日期
    if (values.date && dayjs.isDayjs(values.date)) {
      params.reportMonth = values.date.format('YYYY-MM');
    }

    // 处理员工ID
    if (values.employeeId) {
      params.employeeId = Number(values.employeeId);
    }

    // 处理确认状态
    if (values.confirmationStatus) {
      params.confirmationStatus = values.confirmationStatus as MonthlyReportStatus;
    }

    setSearchParams(params);
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    const resetParams: QueryMonthlyReportParams = {
      page: 1,
      pageSize: 20,
      reportMonth: dayjs().subtract(1, 'month').format('YYYY-MM'),
    };
    setSearchParams(resetParams);
  };

  // 分页处理
  const handleTableChange = (page: number, pageSize: number) => {
    setSearchParams({
      ...searchParams,
      page,
      pageSize,
    });
  };

  // 导出数据
  const handleExport = async () => {
    try {
      const blob = await attendanceApi.exportMonthlyReports(searchParams);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `考勤月报_${searchParams.reportMonth || dayjs().format('YYYY-MM')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success('导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    }
  };

  // 手动计算月报
  const handleCalculateReport = async (reportMonth?: string) => {
    try {
      const month = reportMonth || searchParams.reportMonth;
      if (!month) {
        message.error('请选择月份');
        return;
      }
      
      await attendanceApi.calculateMonthlyReport({ reportMonth: month });
      message.success('月报计算已触发，请稍后刷新查看结果');
      
      // 延迟刷新数据
      setTimeout(() => {
        loadData();
      }, 2000);
    } catch (error) {
      console.error('触发月报计算失败:', error);
      message.error('触发月报计算失败');
    }
  };

  // 确认月报
  const handleConfirm = async (id: number, remark?: string) => {
    try {
      await attendanceApi.confirmMonthlyReport(id, { remark });
      message.success('月报确认成功');
      loadData();
    } catch (error) {
      console.error('确认月报失败:', error);
      message.error('确认月报失败');
    }
  };

  // 获取出勤率颜色
  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 95) return '#52c41a';
    if (rate >= 90) return '#faad14';
    if (rate >= 80) return '#fa8c16';
    return '#f5222d';
  };

  // 表格列定义
  const columns: ColumnsType<AttendanceMonthlyReport> = [
    {
      title: '员工信息',
      key: 'employee',
      width: 140,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.realName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.employeeNo}</div>
          {record.nickname && (
            <div style={{ fontSize: '12px', color: '#999' }}>({record.nickname})</div>
          )}
        </div>
      ),
    },
    {
      title: '报告月份',
      dataIndex: 'reportMonth',
      key: 'reportMonth',
      width: 100,
      align: 'center',
    },
    {
      title: '应出勤',
      dataIndex: 'expectedWorkingDays',
      key: 'expectedWorkingDays',
      width: 80,
      align: 'center',
      render: (days) => <Tag color="blue">{days}天</Tag>,
    },
    {
      title: '实际出勤',
      dataIndex: 'actualWorkingDays',
      key: 'actualWorkingDays',
      width: 80,
      align: 'center',
      render: (days) => <Tag color="green">{days}天</Tag>,
    },
    {
      title: '出勤率',
      key: 'attendanceRate',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const rate = record.expectedWorkingDays > 0 
          ? Math.round((record.actualWorkingDays / record.expectedWorkingDays) * 100) 
          : 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress 
              type="circle" 
              size={40} 
              percent={rate} 
              strokeColor={getAttendanceRateColor(rate)}
              format={(percent) => `${percent}%`}
            />
          </div>
        );
      },
      sorter: (a, b) => {
        const rateA = a.expectedWorkingDays > 0 ? (a.actualWorkingDays / a.expectedWorkingDays) * 100 : 0;
        const rateB = b.expectedWorkingDays > 0 ? (b.actualWorkingDays / b.expectedWorkingDays) * 100 : 0;
        return rateA - rateB;
      },
    },
    {
      title: '缺勤天数',
      dataIndex: 'absentDays',
      key: 'absentDays',
      width: 80,
      align: 'center',
      render: (days) => days > 0 ? <Tag color="red">{days}天</Tag> : <Tag>0天</Tag>,
    },
    {
      title: '迟到时长',
      dataIndex: 'totalLateMinutes',
      key: 'totalLateMinutes',
      width: 100,
      align: 'center',
      render: (minutes) => {
        if (minutes > 0) {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return (
            <Tooltip title={`总计${minutes}分钟`}>
              <Tag color="orange">
                {hours > 0 ? `${hours}h${mins}m` : `${mins}m`}
              </Tag>
            </Tooltip>
          );
        }
        return <Tag>0</Tag>;
      },
    },
    {
      title: '早退时长',
      dataIndex: 'totalEarlyLeaveMinutes',
      key: 'totalEarlyLeaveMinutes',
      width: 100,
      align: 'center',
      render: (minutes) => {
        if (minutes > 0) {
          const hours = Math.floor(minutes / 60);
          const mins = minutes % 60;
          return (
            <Tooltip title={`总计${minutes}分钟`}>
              <Tag color="red">
                {hours > 0 ? `${hours}h${mins}m` : `${mins}m`}
              </Tag>
            </Tooltip>
          );
        }
        return <Tag>0</Tag>;
      },
    },
    {
      title: '补卡次数',
      dataIndex: 'makeupCardCount',
      key: 'makeupCardCount',
      width: 80,
      align: 'center',
      render: (count) => count > 0 ? <Tag color="purple">{count}次</Tag> : <Tag>0次</Tag>,
    },
    {
      title: '加班时长',
      key: 'overtimeHours',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const weekendHours = Number(record.weekendOvertimeHours || 0);
        const legalHours = Number(record.legalHolidayOvertimeHours || 0);
        const total = weekendHours + legalHours;
        return (
          <div>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {total.toFixed(1)}h
            </div>
            {weekendHours > 0 && (
              <div style={{ fontSize: '12px', color: '#1890ff' }}>
                周末: {weekendHours.toFixed(1)}h
              </div>
            )}
            {legalHours > 0 && (
              <div style={{ fontSize: '12px', color: '#f50' }}>
                节假日: {legalHours.toFixed(1)}h
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '确认状态',
      dataIndex: 'confirmationStatus',
      key: 'confirmationStatus',
      width: 100,
      align: 'center',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: '草稿', value: MonthlyReportStatus.DRAFT },
        { text: '待确认', value: MonthlyReportStatus.PENDING },
        { text: '已确认', value: MonthlyReportStatus.CONFIRMED },
        { text: '已拒绝', value: MonthlyReportStatus.REJECTED },
        { text: '已锁定', value: MonthlyReportStatus.LOCKED },
      ],
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.confirmationStatus === MonthlyReportStatus.DRAFT && (
            <Button 
              size="small" 
              type="link" 
              onClick={() => handleConfirm(record.id)}
            >
              确认
            </Button>
          )}
          <Tooltip title="查看详情">
            <Button 
              size="small" 
              type="link" 
              icon={<FileTextOutlined />}
              onClick={() => {
                // 查看详情逻辑
                message.info('查看详情功能开发中');
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>{`考勤月报 - ${'HMF EHR 系统'}`}</title>
      </Helmet>

      <div className="page-container">
        <div className="page-header">
          <Title level={2} className="page-title">考勤月报</Title>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card size="small">
              <Statistic
                title="总员工数"
                value={statistics.totalEmployees}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card size="small">
              <Statistic
                title="平均出勤率"
                value={statistics.averageAttendanceRate}
                suffix="%"
                valueStyle={{ color: getAttendanceRateColor(statistics.averageAttendanceRate) }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card size="small">
              <Statistic
                title="总缺勤天数"
                value={statistics.totalAbsentDays}
                suffix="天"
                valueStyle={{ color: '#f5222d' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card size="small">
              <Statistic
                title="总加班时长"
                value={Number(statistics.totalOvertimeHours || 0).toFixed(1)}
                suffix="h"
                valueStyle={{ color: '#1890ff' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 搜索表单 */}
        <Card style={{ marginBottom: 16 }}>
          <Form
            form={form}
            layout="inline"
            onFinish={handleSearch}
            initialValues={{
              date: dayjs().subtract(1, 'month'), // 默认上个月
            }}
          >
            <Form.Item name="date" label="月份">
              <MonthPicker 
                format="YYYY-MM"
                placeholder="选择月份"
                style={{ width: 120 }}
              />
            </Form.Item>
            <Form.Item name="employeeId" label="员工">
              <Select 
                placeholder="选择员工" 
                allowClear
                style={{ width: 140 }}
                showSearch
                optionFilterProp="children"
              >
                {/* 这里应该从API获取员工列表，暂时留空 */}
              </Select>
            </Form.Item>
            <Form.Item name="confirmationStatus" label="确认状态">
              <Select 
                placeholder="选择状态" 
                allowClear
                style={{ width: 120 }}
              >
                <Option value={MonthlyReportStatus.DRAFT}>草稿</Option>
                <Option value={MonthlyReportStatus.PENDING}>待确认</Option>
                <Option value={MonthlyReportStatus.CONFIRMED}>已确认</Option>
                <Option value={MonthlyReportStatus.REJECTED}>已拒绝</Option>
                <Option value={MonthlyReportStatus.LOCKED}>已锁定</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  查询
                </Button>
                <Button onClick={handleReset} icon={<ReloadOutlined />}>
                  重置
                </Button>
                <Button type="default" onClick={() => handleCalculateReport()} icon={<CalendarOutlined />}>
                  计算月报
                </Button>
                <Button onClick={handleExport} icon={<ExportOutlined />}>
                  导出
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        {/* 数据表格 */}
        <Card>
          <Spin spinning={loading}>
            {data.length > 0 ? (
              <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                scroll={{ x: 1400 }}
                pagination={{
                  current: pagination.page,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                  onChange: handleTableChange,
                  onShowSizeChange: handleTableChange,
                  pageSizeOptions: ['10', '20', '50', '100'],
                }}
                size="small"
              />
            ) : (
              <Empty 
                description="暂无月报数据"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '60px 0' }}
              />
            )}
          </Spin>
        </Card>
      </div>
    </>
  );
};

export default AttendanceMonthlyReport;
