import React from 'react';
import { Card, Typography } from 'antd';
import { Helmet } from 'react-helmet-async';

const { Title } = Typography;

const SalaryManagement: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>薪酬管理 - {import.meta.env.VITE_APP_TITLE}</title>
      </Helmet>
      <div className="page-container">
        <div className="page-header">
          <Title level={2} className="page-title">薪酬管理</Title>
        </div>
        <Card><p>薪酬管理功能开发中...</p></Card>
      </div>
    </>
  );
};

export default SalaryManagement;
