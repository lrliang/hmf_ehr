import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>页面未找到 - {import.meta.env.VITE_APP_TITLE}</title>
      </Helmet>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: '#f5f5f5'
      }}>
        <Result
          status="404"
          title="404"
          subTitle="抱歉，您访问的页面不存在"
          extra={
            <Button type="primary" onClick={() => navigate('/dashboard')}>
              返回首页
            </Button>
          }
        />
      </div>
    </>
  );
};

export default NotFound;
