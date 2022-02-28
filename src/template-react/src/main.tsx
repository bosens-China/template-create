import React from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from 'antd/lib/locale/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
import 'antd/dist/antd.css';
import { Provider } from 'react-redux';
import Route from './route';
import { store } from './store';

moment.locale('zh-cn');
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <Route />
      </ConfigProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root'),
);
