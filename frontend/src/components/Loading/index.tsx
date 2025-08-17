import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import classNames from 'classnames';

interface LoadingProps {
  size?: 'small' | 'default' | 'large';
  spinning?: boolean;
  tip?: string;
  className?: string;
  fullScreen?: boolean;
  children?: React.ReactNode;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'default',
  spinning = true,
  tip,
  className,
  fullScreen = false,
  children,
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: getIconSize(size) }} spin />;

  const loadingClassName = classNames(
    'loading-container',
    {
      'full-screen': fullScreen,
    },
    className
  );

  if (children) {
    return (
      <Spin spinning={spinning} indicator={antIcon} tip={tip} size={size}>
        {children}
      </Spin>
    );
  }

  return (
    <div className={loadingClassName}>
      <Spin indicator={antIcon} tip={tip} size={size} />
    </div>
  );
};

function getIconSize(size: 'small' | 'default' | 'large'): number {
  switch (size) {
    case 'small':
      return 16;
    case 'large':
      return 32;
    default:
      return 24;
  }
}

export default Loading;
