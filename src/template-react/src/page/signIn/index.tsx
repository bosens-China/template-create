import { Form, Input, Button, message } from 'antd';
import React, { useEffect } from 'react';
import { useRequest } from 'ahooks';
import { FormValues, signIn } from '@/api/user';
import { useNavigate } from 'react-router-dom';
import './style.less';
import { setToken } from '@/utils/user';

const SignIn = () => {
  const navigate = useNavigate();
  const { run, loading } = useRequest(signIn, {
    manual: true,
    onError(err) {
      message.error(err instanceof Error ? err.message : String(err));
    },
    onSuccess(data) {
      setToken(data);
      message.success(`登录成功！`);
      navigate('/');
    },
  });
  const onFinish = (values: FormValues) => {
    run(values);
  };
  // 进入清空
  useEffect(() => {
    setToken('');
  }, []);

  return (
    <div className="sign">
      <Form
        className="sign-form"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          label="用户名"
          name="userName"
          rules={[
            {
              required: true,
              message: '请输入用户名！',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[
            {
              required: true,
              message: '请输入密码！',
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button block type="primary" loading={loading} htmlType="submit">
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SignIn;
