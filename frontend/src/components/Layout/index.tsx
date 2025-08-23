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
    permission: ['attendance:view'],
    children: [
      {
        key: '/attendance/records',
        label: '打卡明细',
        path: '/attendance/records',
        permission: ['attendance:view'],
      },
    ],
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
    key: '/statistics',
    label: '统计分析',
    icon: <BarChartOutlined />,
    permission: ['report:view'],
    children: [
      {
        key: '/statistics/attendance-monthly',
        label: '考勤月报',
        path: '/statistics/attendance-monthly',
        permission: ['report:view'],
      },
    ],
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

  // 获取当前选中的菜单和展开的菜单
  const selectedKeys = [location.pathname];
  const [openKeys, setOpenKeys] = React.useState<string[]>(() => {
    const keys: string[] = [];
    const pathParts = location.pathname.split('/');
    if (pathParts.length > 2) {
      // 如果是子路由，展开父菜单
      const parentPath = `/${pathParts[1]}`;
      keys.push(parentPath);
    }
    return keys;
  });

  // 处理菜单展开/收起
  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys);
  };

  // 路由变化时更新展开状态
  React.useEffect(() => {
    const pathParts = location.pathname.split('/');
    if (pathParts.length > 2) {
      // 如果是子路由，确保父菜单展开
      const parentPath = `/${pathParts[1]}`;
      setOpenKeys(prevKeys => {
        if (!prevKeys.includes(parentPath)) {
          return [...prevKeys, parentPath];
        }
        return prevKeys;
      });
    }
  }, [location.pathname]);

  // 生成面包屑
  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items = [{ title: '首页', href: '/' }];
    
    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      
      // 查找主菜单
      const menuItem = menuItems.find(item => item.path === currentPath);
      if (menuItem) {
        items.push({ title: menuItem.label });
      } else {
        // 查找子菜单
        for (const parent of menuItems) {
          if (parent.children) {
            const childItem = parent.children.find(child => child.path === currentPath);
            if (childItem) {
              // 如果还没有添加父级菜单，先添加父级
              if (!items.find(item => item.title === parent.label)) {
                items.push({ title: parent.label });
              }
              items.push({ title: childItem.label });
              break;
            }
          }
        }
      }
    });
    
    return items;
  };

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    // 查找菜单项
    const findMenuItemByKey = (items: MenuItem[], targetKey: string): MenuItem | null => {
      for (const item of items) {
        if (item.key === targetKey) {
          return item;
        }
        if (item.children) {
          const found = findMenuItemByKey(item.children, targetKey);
          if (found) return found;
        }
      }
      return null;
    };

    const menuItem = findMenuItemByKey(menuItems, key);
    // 只有有path属性的菜单项才进行导航
    if (menuItem && menuItem.path) {
      navigate(menuItem.path);
    }
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
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          onClick={handleMenuClick}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            children: item.children?.map(child => ({
              key: child.key,
              label: child.label,
            })),
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
