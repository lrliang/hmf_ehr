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
import { AttendanceResult } from '@/types';

const { Title } = Typography;
const { MonthPicker } = DatePicker;
const { Option } = Select;

// 月报数据接口定义
interface MonthlyReportRecord {
  employeeId: number;
  employeeName: string;
  employeeNo: string;
  department?: string;
  position?: string;
  totalDays: number;           // 应出勤天数
  actualDays: number;          // 实际出勤天数
  normalDays: number;          // 正常出勤天数
  lateDays: number;           // 迟到天数
  earlyLeaveDays: number;     // 早退天数
  absentDays: number;         // 缺勤天数
  overtimeDays: number;       // 加班天数
  manualDays: number;         // 补签天数
  attendanceRate: number;     // 出勤率
  punctualityRate: number;    // 准时率
  totalWorkHours: number;     // 总工作时长
  overtimeHours: number;      // 加班时长
}

// 查询参数接口
interface QueryMonthlyReportParams {
  year: number;
  month: number;
  employeeName?: string;
  department?: string;
}

// 模拟数据
const generateMockData = (params: QueryMonthlyReportParams): MonthlyReportRecord[] => {
  const mockData: MonthlyReportRecord[] = [];
  const employees = [
    { id: 1, name: '张三', no: 'E001', department: '烘焙部', position: '烘焙师' },
    { id: 2, name: '李四', no: 'E002', department: '销售部', position: '店员' },
    { id: 3, name: '王五', no: 'E003', department: '管理部', position: '店长' },
    { id: 4, name: '赵六', no: 'E004', department: '烘焙部', position: '学徒' },
    { id: 5, name: '钱七', no: 'E005', department: '销售部', position: '收银员' },
  ];

  employees.forEach(emp => {
    const totalDays = 22; // 假设月工作日为22天
    const actualDays = Math.floor(Math.random() * 3) + 20; // 20-22天
    const lateDays = Math.floor(Math.random() * 3);
    const earlyLeaveDays = Math.floor(Math.random() * 2);
    const absentDays = totalDays - actualDays;
    const normalDays = actualDays - lateDays - earlyLeaveDays;
    const overtimeDays = Math.floor(Math.random() * 5);
    const manualDays = Math.floor(Math.random() * 2);

    mockData.push({
      employeeId: emp.id,
      employeeName: emp.name,
      employeeNo: emp.no,
      department: emp.department,
      position: emp.position,
      totalDays,
      actualDays,
      normalDays,
      lateDays,
      earlyLeaveDays,
      absentDays,
      overtimeDays,
      manualDays,
      attendanceRate: Math.round((actualDays / totalDays) * 100),
      punctualityRate: Math.round((normalDays / actualDays) * 100),
      totalWorkHours: actualDays * 8 + overtimeDays * 2,
      overtimeHours: overtimeDays * 2,
    });
  });

  return mockData;
};

const AttendanceMonthlyReport: React.FC = () => {
  const [form] = Form.useForm();
  
  // 状态管理
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MonthlyReportRecord[]>([]);
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    averageAttendanceRate: 0,
    averagePunctualityRate: 0,
    totalAbsentDays: 0,
    totalOvertimeHours: 0,
  });

  // 搜索参数
  const [searchParams, setSearchParams] = useState<QueryMonthlyReportParams>({
    year: dayjs().year(),
    month: dayjs().month() + 1,
  });

  // 加载数据
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 这里应该调用真实的API，现在使用模拟数据
      // const result = await attendanceApi.getMonthlyReport(searchParams);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
      
      const result = generateMockData(searchParams);
      setData(result);
      
      // 计算统计数据
      const stats = result.reduce((acc, record) => {
        acc.totalEmployees++;
        acc.averageAttendanceRate += record.attendanceRate;
        acc.averagePunctualityRate += record.punctualityRate;
        acc.totalAbsentDays += record.absentDays;
        acc.totalOvertimeHours += record.overtimeHours;
        return acc;
      }, {
        totalEmployees: 0,
        averageAttendanceRate: 0,
        averagePunctualityRate: 0,
        totalAbsentDays: 0,
        totalOvertimeHours: 0,
      });

      if (stats.totalEmployees > 0) {
        stats.averageAttendanceRate = Math.round(stats.averageAttendanceRate / stats.totalEmployees);
        stats.averagePunctualityRate = Math.round(stats.averagePunctualityRate / stats.totalEmployees);
      }

      setStatistics(stats);
    } catch (error) {
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
      ...searchParams,
      ...values,
    };

    // 处理日期
    if (values.date) {
      params.year = values.date.year();
      params.month = values.date.month() + 1;
    }

    setSearchParams(params);
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setSearchParams({
      year: dayjs().year(),
      month: dayjs().month() + 1,
    });
  };

  // 导出数据
  const handleExport = async () => {
    try {
      message.success('导出功能开发中...');
      // 这里实现导出逻辑
    } catch (error) {
      message.error('导出失败');
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
  const columns: ColumnsType<MonthlyReportRecord> = [
    {
      title: '员工信息',
      key: 'employee',
      width: 120,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{record.employeeName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.employeeNo}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>{record.position}</div>
        </div>
      ),
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      width: 100,
    },
    {
      title: '应出勤',
      dataIndex: 'totalDays',
      key: 'totalDays',
      width: 80,
      align: 'center',
      render: (days) => <Tag color="blue">{days}天</Tag>,
    },
    {
      title: '实际出勤',
      dataIndex: 'actualDays',
      key: 'actualDays',
      width: 80,
      align: 'center',
      render: (days) => <Tag color="green">{days}天</Tag>,
    },
    {
      title: '出勤率',
      dataIndex: 'attendanceRate',
      key: 'attendanceRate',
      width: 100,
      align: 'center',
      render: (rate) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress 
            type="circle" 
            size={40} 
            percent={rate} 
            strokeColor={getAttendanceRateColor(rate)}
            format={(percent) => `${percent}%`}
          />
        </div>
      ),
      sorter: (a, b) => a.attendanceRate - b.attendanceRate,
    },
    {
      title: '正常出勤',
      dataIndex: 'normalDays',
      key: 'normalDays',
      width: 80,
      align: 'center',
      render: (days) => days > 0 ? <Tag color="green">{days}天</Tag> : <Tag>0天</Tag>,
    },
    {
      title: '迟到',
      dataIndex: 'lateDays',
      key: 'lateDays',
      width: 60,
      align: 'center',
      render: (days) => days > 0 ? <Tag color="orange">{days}天</Tag> : <Tag>0天</Tag>,
    },
    {
      title: '早退',
      dataIndex: 'earlyLeaveDays',
      key: 'earlyLeaveDays',
      width: 60,
      align: 'center',
      render: (days) => days > 0 ? <Tag color="red">{days}天</Tag> : <Tag>0天</Tag>,
    },
    {
      title: '缺勤',
      dataIndex: 'absentDays',
      key: 'absentDays',
      width: 60,
      align: 'center',
      render: (days) => days > 0 ? <Tag color="red">{days}天</Tag> : <Tag>0天</Tag>,
    },
    {
      title: '加班',
      dataIndex: 'overtimeDays',
      key: 'overtimeDays',
      width: 60,
      align: 'center',
      render: (days) => days > 0 ? <Tag color="blue">{days}天</Tag> : <Tag>0天</Tag>,
    },
    {
      title: '补签',
      dataIndex: 'manualDays',
      key: 'manualDays',
      width: 60,
      align: 'center',
      render: (days) => days > 0 ? <Tag color="purple">{days}天</Tag> : <Tag>0天</Tag>,
    },
    {
      title: '准时率',
      dataIndex: 'punctualityRate',
      key: 'punctualityRate',
      width: 80,
      align: 'center',
      render: (rate) => (
        <Tag color={rate >= 90 ? 'green' : rate >= 80 ? 'orange' : 'red'}>
          {rate}%
        </Tag>
      ),
    },
    {
      title: '工作时长',
      key: 'workHours',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div>
          <div>{record.totalWorkHours}h</div>
          {record.overtimeHours > 0 && (
            <div style={{ fontSize: '12px', color: '#1890ff' }}>
              加班 {record.overtimeHours}h
            </div>
          )}
        </div>
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
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="总员工数"
                value={statistics.totalEmployees}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
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
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Statistic
                title="平均准时率"
                value={statistics.averagePunctualityRate}
                suffix="%"
                valueStyle={{ color: statistics.averagePunctualityRate >= 90 ? '#52c41a' : '#fa8c16' }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
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
            <Form.Item name="employeeName" label="员工姓名">
              <Select 
                placeholder="选择员工" 
                allowClear
                style={{ width: 140 }}
                showSearch
              >
                <Option value="张三">张三</Option>
                <Option value="李四">李四</Option>
                <Option value="王五">王五</Option>
                <Option value="赵六">赵六</Option>
                <Option value="钱七">钱七</Option>
              </Select>
            </Form.Item>
            <Form.Item name="department" label="部门">
              <Select 
                placeholder="选择部门" 
                allowClear
                style={{ width: 120 }}
              >
                <Option value="烘焙部">烘焙部</Option>
                <Option value="销售部">销售部</Option>
                <Option value="管理部">管理部</Option>
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
                rowKey="employeeId"
                scroll={{ x: 1200 }}
                pagination={{
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                }}
                size="small"
              />
            ) : (
              <Empty 
                description="暂无数据"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Spin>
        </Card>
      </div>
    </>
  );
};

export default AttendanceMonthlyReport;
