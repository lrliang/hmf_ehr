import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';

import { RootState } from './store';
import Loading from './components/Loading';
import AuthRoute from './components/AuthRoute';
import Layout from './components/Layout';

// 懒加载页面组件
const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const UserManagement = React.lazy(() => import('./pages/UserManagement'));
const EmployeeManagement = React.lazy(() => import('./pages/EmployeeManagement'));
const AttendanceManagement = React.lazy(() => import('./pages/AttendanceManagement'));
const LeaveManagement = React.lazy(() => import('./pages/LeaveManagement'));
const GoalManagement = React.lazy(() => import('./pages/GoalManagement'));
const SalaryManagement = React.lazy(() => import('./pages/SalaryManagement'));
const ReportManagement = React.lazy(() => import('./pages/ReportManagement'));
const Profile = React.lazy(() => import('./pages/Profile'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

function App() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <>
      <Helmet>
        <title>{import.meta.env.VITE_APP_TITLE || 'HMF EHR 人力资源管理系统'}</title>
        <meta name="description" content={import.meta.env.VITE_APP_DESCRIPTION || '县城烘焙连锁店HR数字化人力资源管理系统'} />
      </Helmet>

      <Suspense fallback={<Loading />}>
        <Routes>
          {/* 登录页面 */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login />
              )
            } 
          />

          {/* 主应用路由 */}
          <Route path="/" element={<AuthRoute><Layout /></AuthRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            
            {/* 用户管理 */}
            <Route path="users" element={<UserManagement />} />
            
            {/* 员工管理 */}
            <Route path="employees" element={<EmployeeManagement />} />
            
            {/* 考勤管理 */}
            <Route path="attendance" element={<AttendanceManagement />} />
            
            {/* 请假管理 */}
            <Route path="leave" element={<LeaveManagement />} />
            
            {/* 目标管理 */}
            <Route path="goals" element={<GoalManagement />} />
            
            {/* 薪酬管理 */}
            <Route path="salary" element={<SalaryManagement />} />
            
            {/* 报表管理 */}
            <Route path="reports" element={<ReportManagement />} />
            
            {/* 个人中心 */}
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* 404页面 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
