import React from 'react';
import { Card, Typography } from 'antd';
import { Helmet } from 'react-helmet-async';

const { Title } = Typography;

const ReportManagement: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>{`报表统计 - ${import.meta.env.VITE_APP_TITLE || 'HMF EHR 系统'}`}</title>
      </Helmet>
      <div className="page-container">
        <div className="page-header">
          <Title level={2} className="page-title">报表统计</Title>
        </div>
        <Card><p>报表统计功能开发中...</p></Card>
      </div>
    </>
  );
};

export default ReportManagement;
