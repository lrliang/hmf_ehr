import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout as AntdLayout, Menu, Avatar, Dropdown, theme, Breadcrumb } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  TrophyOutlined,
  DollarOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { toggleSider } from '@/store/slices/uiSlice';
import { logoutAsync } from '@/store/slices/authSlice';
import type { MenuItem } from '@/types';

const { Header, Sider, Content } = AntdLayout;

// 菜单配置
const menuItems: MenuItem[] = [
  {
    key: '/dashboard',
    label: '仪表盘',
    icon: <DashboardOutlined />,
    path: '/dashboard',
  },
  {
    key: '/users',
    label: '用户管理',
    icon: <UserOutlined />,
    path: '/users',
    permission: ['user:view'],
  },
  {
    key: '/employees',
    label: '员工管理',
    icon: <TeamOutlined />,
    path: '/employees',
    permission: ['employee:view'],
  },
  {
    key: '/attendance',
    label: '考勤管理',
    icon: <ClockCircleOutlined />,
    path: '/attendance',
    permission: ['attendance:view'],
  },
  {
    key: '/leave',
    label: '请假管理',
    icon: <CalendarOutlined />,
    path: '/leave',
    permission: ['leave:view'],
  },
  {
    key: '/goals',
    label: '目标管理',
    icon: <TrophyOutlined />,
    path: '/goals',
    permission: ['goal:view'],
  },
  {
    key: '/salary',
    label: '薪酬管理',
    icon: <DollarOutlined />,
    path: '/salary',
    permission: ['salary:view'],
  },
  {
    key: '/reports',
    label: '报表统计',
    icon: <BarChartOutlined />,
    path: '/reports',
    permission: ['report:view'],
  },
];

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { siderCollapsed } = useAppSelector(state => state.ui);
  const { user } = useAppSelector(state => state.auth);
  
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // 获取当前选中的菜单
  const selectedKeys = [location.pathname];

  // 生成面包屑
  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items = [{ title: '首页', href: '/' }];
    
    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const menuItem = menuItems.find(item => item.path === currentPath);
      if (menuItem) {
        items.push({ title: menuItem.label });
      }
    });
    
    return items;
  };

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'profile':
        navigate('/profile');
        break;
      case 'settings':
        navigate('/settings');
        break;
      case 'logout':
        dispatch(logoutAsync());
        break;
    }
  };

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
    },
  ];

  return (
    <AntdLayout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={siderCollapsed}
        theme="dark"
        width={256}
      >
        <div className="logo" style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 18,
          fontWeight: 'bold',
        }}>
          {siderCollapsed ? 'HMF' : 'HMF EHR'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          onClick={handleMenuClick}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
          }))}
        />
      </Sider>
      
      <AntdLayout>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => dispatch(toggleSider())}
              style={{
                fontSize: 16,
                width: 32,
                height: 32,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              {siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            
            <Breadcrumb items={getBreadcrumbItems()} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            
            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                gap: 8,
              }}>
                <Avatar size="small" icon={<UserOutlined />} src={user?.avatar} />
                <span>{user?.realName || user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{
          margin: 0,
          minHeight: 'calc(100vh - 64px)',
          background: '#f5f5f5',
        }}>
          <Outlet />
        </Content>
      </AntdLayout>
    </AntdLayout>
  );
};

export default Layout;
