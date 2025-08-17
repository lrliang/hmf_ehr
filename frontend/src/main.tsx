import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { HelmetProvider } from 'react-helmet-async';
import zhCN from 'antd/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

import App from './App.tsx';
import { store, persistor } from './store';
import { antdTheme } from './config/theme.ts';
import Loading from './components/Loading';

import './styles/index.scss';

// 设置dayjs中文
dayjs.locale('zh-cn');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <BrowserRouter>
          <HelmetProvider>
            <ConfigProvider
              locale={zhCN}
              theme={antdTheme}
              componentSize="middle"
            >
              <AntdApp>
                <App />
              </AntdApp>
            </ConfigProvider>
          </HelmetProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
