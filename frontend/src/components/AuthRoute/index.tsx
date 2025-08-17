import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';

interface AuthRouteProps {
  children: React.ReactNode;
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAppSelector(state => state.auth);
  const location = useLocation();

  // 如果正在加载，显示loading
  if (loading) {
    return <div>Loading...</div>;
  }

  // 如果未认证，重定向到登录页
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 已认证，渲染子组件
  return <>{children}</>;
};

export default AuthRoute;
