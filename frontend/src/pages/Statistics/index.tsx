import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Card, Menu, Typography } from 'antd';
import { Helmet } from 'react-helmet-async';
import { BarChartOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

// 统计模块二级菜单配置
const menuItems = [
  {
    key: '/statistics/attendance-monthly',
    label: '考勤月报',
    icon: <CalendarOutlined />,
  },
  // 可以在这里添加更多统计功能
  // {
  //   key: '/statistics/salary-report',
  //   label: '薪酬统计',
  //   icon: <DollarOutlined />,
  // },
  // {
  //   key: '/statistics/employee-report',
  //   label: '员工统计',
  //   icon: <UserOutlined />,
  // },
];

const Statistics: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([location.pathname]);

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedKeys([key]);
    navigate(key);
  };

  // 如果是根路径，重定向到考勤月报
  React.useEffect(() => {
    if (location.pathname === '/statistics') {
      navigate('/statistics/attendance-monthly', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <>
      <Helmet>
        <title>{`统计分析 - ${'HMF EHR 系统'}`}</title>
      </Helmet>

      <div className="page-container">
        <div className="page-header">
          <Title level={2} className="page-title">统计分析</Title>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          {/* 左侧菜单 */}
          <Card 
            style={{ width: 200, height: 'fit-content' }}
            bodyStyle={{ padding: 0 }}
          >
            <Menu
              mode="vertical"
              selectedKeys={selectedKeys}
              onClick={handleMenuClick}
              items={menuItems.map(item => ({
                key: item.key,
                icon: item.icon,
                label: item.label,
              }))}
              style={{ border: 'none' }}
            />
          </Card>

          {/* 右侧内容区域 */}
          <div style={{ flex: 1, minHeight: '600px' }}>
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
};

export default Statistics;
