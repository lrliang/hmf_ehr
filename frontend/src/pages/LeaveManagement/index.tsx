import React from 'react';
import { Card, Typography } from 'antd';
import { Helmet } from 'react-helmet-async';

const { Title } = Typography;

const LeaveManagement: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>{`请假管理 - ${import.meta.env.VITE_APP_TITLE || 'HMF EHR 系统'}`}</title>
      </Helmet>
      <div className="page-container">
        <div className="page-header">
          <Title level={2} className="page-title">请假管理</Title>
        </div>
        <Card><p>请假管理功能开发中...</p></Card>
      </div>
    </>
  );
};

export default LeaveManagement;
