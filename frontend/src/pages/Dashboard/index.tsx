import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Table, Progress, Typography } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  ClockCircleOutlined, 
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppSelector } from '@/store/hooks';
import './index.scss';

const { Title, Text } = Typography;

// 模拟数据
const attendanceData = [
  { name: '周一', value: 95 },
  { name: '周二', value: 98 },
  { name: '周三', value: 92 },
  { name: '周四', value: 96 },
  { name: '周五', value: 94 },
  { name: '周六', value: 88 },
  { name: '周日', value: 85 },
];

const departmentData = [
  { name: '总店', value: 45, color: '#1890ff' },
  { name: '分店A', value: 32, color: '#52c41a' },
  { name: '分店B', value: 28, color: '#faad14' },
  { name: '分店C', value: 15, color: '#f5222d' },
];

const recentActivities = [
  { id: 1, type: 'leave', user: '张三', action: '提交了请假申请', time: '2小时前' },
  { id: 2, type: 'attendance', user: '李四', action: '迟到打卡', time: '3小时前' },
  { id: 3, type: 'salary', user: '王五', action: '薪资已发放', time: '5小时前' },
  { id: 4, type: 'goal', user: '赵六', action: '完成月度目标', time: '1天前' },
];

const Dashboard: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 加载仪表盘数据
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const activityColumns = [
    {
      title: '用户',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: '时间',
      dataIndex: 'time',
      key: 'time',
    },
  ];

  return (
    <>
      <Helmet>
        <title>{`仪表盘 - ${import.meta.env.VITE_APP_TITLE || 'HMF EHR 系统'}`}</title>
      </Helmet>

      <div className="dashboard-container">
        {/* 欢迎信息 */}
        <div className="welcome-section">
          <Title level={2}>
            欢迎回来，{user?.realName || user?.username}！
          </Title>
          <Text type="secondary">
            今天是 {new Date().toLocaleDateString('zh-CN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </Text>
        </div>

        {/* 统计卡片 */}
        <Row gutter={[16, 16]} className="stats-row">
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="总员工数"
                value={120}
                prefix={<TeamOutlined />}
                suffix={
                  <span className="trend-up">
                    <RiseOutlined /> 12%
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="今日出勤率"
                value={96.8}
                prefix={<ClockCircleOutlined />}
                suffix="%"
                precision={1}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="待审批请假"
                value={8}
                prefix={<UserOutlined />}
                suffix={
                  <span className="trend-down">
                    <FallOutlined /> 25%
                  </span>
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <Statistic
                title="本月薪资"
                value={286000}
                prefix={<DollarOutlined />}
                suffix="元"
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="charts-row">
          {/* 出勤率趋势 */}
          <Col xs={24} lg={16}>
            <Card title="本周出勤率趋势" loading={loading}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#1890ff" 
                    strokeWidth={2}
                    dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* 部门人员分布 */}
          <Col xs={24} lg={8}>
            <Card title="部门人员分布" loading={loading}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="content-row">
          {/* 目标完成情况 */}
          <Col xs={24} lg={12}>
            <Card title="本月目标完成情况" loading={loading}>
              <div className="goal-item">
                <div className="goal-header">
                  <span>销售目标</span>
                  <span>85%</span>
                </div>
                <Progress percent={85} status="active" />
              </div>
              <div className="goal-item">
                <div className="goal-header">
                  <span>客户满意度</span>
                  <span>92%</span>
                </div>
                <Progress percent={92} status="active" />
              </div>
              <div className="goal-item">
                <div className="goal-header">
                  <span>员工培训</span>
                  <span>76%</span>
                </div>
                <Progress percent={76} status="active" />
              </div>
              <div className="goal-item">
                <div className="goal-header">
                  <span>成本控制</span>
                  <span>68%</span>
                </div>
                <Progress percent={68} status="active" />
              </div>
            </Card>
          </Col>

          {/* 最近活动 */}
          <Col xs={24} lg={12}>
            <Card title="最近活动" loading={loading}>
              <Table
                columns={activityColumns}
                dataSource={recentActivities}
                pagination={false}
                size="small"
                rowKey="id"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Dashboard;
