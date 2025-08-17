import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginAsync } from '@/store/slices/authSlice';
import type { LoginRequest } from '@/types';
import './index.scss';

// Location state type
interface LocationState {
  from?: {
    pathname: string;
  };
}

const { Title, Text } = Typography;

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  const { loading, isAuthenticated } = useAppSelector(state => state.auth);

  // 如果已登录，重定向到目标页面或首页
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as LocationState)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (values: LoginRequest) => {
    try {
      await dispatch(loginAsync(values)).unwrap();
      const from = (location.state as LocationState)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      // 错误已在slice中处理
    }
  };

  return (
    <>
      <Helmet>
        <title>{`登录 - ${import.meta.env.VITE_APP_TITLE || 'HMF EHR 系统'}`}</title>
      </Helmet>
      
      <div className="login-container">
        <div className="login-content">
          <div className="login-header">
            <div className="logo">
              <img src="/logo.svg" alt="Logo" />
            </div>
            <Title level={2} className="title">
              {import.meta.env.VITE_APP_TITLE || 'HMF EHR 系统'}
            </Title>
            <Text type="secondary" className="subtitle">
              {import.meta.env.VITE_APP_DESCRIPTION || '人力资源管理系统'}
            </Text>
          </div>
          
          <Card className="login-card" bordered={false}>
            <Title level={3} className="card-title">
              欢迎登录
            </Title>
            
            <Form
              form={form}
              name="login"
              size="large"
              onFinish={handleSubmit}
              autoComplete="off"
              className="login-form"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 3, message: '用户名至少3个字符' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="请输入用户名"
                  autoComplete="username"
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6个字符' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                />
              </Form.Item>
              
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="login-button"
                >
                  {loading ? '登录中...' : '登录'}
                </Button>
              </Form.Item>
            </Form>
            
            <div className="login-tips">
              <Text type="secondary">
                默认账号：admin / admin123
              </Text>
            </div>
          </Card>
        </div>
        
        <div className="login-footer">
          <Text type="secondary">
            © 2024 HMF EHR. All rights reserved.
          </Text>
        </div>
      </div>
    </>
  );
};

export default Login;
