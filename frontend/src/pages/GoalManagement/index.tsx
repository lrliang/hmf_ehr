import React from 'react';
import { Card, Typography } from 'antd';
import { Helmet } from 'react-helmet-async';

const { Title } = Typography;

const GoalManagement: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>目标管理 - {import.meta.env.VITE_APP_TITLE}</title>
      </Helmet>
      <div className="page-container">
        <div className="page-header">
          <Title level={2} className="page-title">目标管理</Title>
        </div>
        <Card><p>目标管理功能开发中...</p></Card>
      </div>
    </>
  );
};

export default GoalManagement;
