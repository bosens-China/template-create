import React, { useEffect, useMemo } from 'react';
import { verification } from '@/api/user';
import { useRequest } from 'ahooks';
import NprogressRoute from '@/components/nprogressRoute';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getToken } from '@/utils/user';

interface AuthenticationProps {
  loginAddress: string;
  children: React.ReactElement;
  auth?: boolean;
}

/*
 * 鉴权组件，首先验证token是否存在，其次与服务器交互验证
 */
const Authentication = (props: AuthenticationProps) => {
  const { children, auth, loginAddress } = props;
  const location = useLocation();
  const navigate = useNavigate();
  const { loading, data, run, error } = useRequest(verification, {
    manual: true,
  });

  /*
   * 这里监听路由的变化，每次跳转都会触发执行此方法
   */
  useEffect(() => {
    const jwt = getToken();
    if (!auth) {
      return;
    }
    if (!jwt) {
      navigate(loginAddress);
      return;
    }
    run(jwt);
  }, [location, run, auth, loginAddress, navigate]);

  /*
   * 注意必须使用 useMemo 包裹着
   */
  return useMemo(() => {
    if (!auth) {
      return children;
    }

    if (error) {
      return <Navigate to={loginAddress} replace />;
    }
    if (loading) {
      return <NprogressRoute />;
    }
    if (data) {
      return children;
    }
    return null;
  }, [auth, loading, data, children, loginAddress, error]);
};

export default Authentication;
