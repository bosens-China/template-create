import React, { lazy } from 'react';

interface RoutesOne {
  path: string;
  Components: React.LazyExoticComponent<() => JSX.Element>;
  auth?: boolean;
}
interface RoutesTow {
  path: string;
  redirect: string;
}

type Routes = RoutesOne | RoutesTow;

const SignIn = lazy(() => import('@/page/signIn'));
const Homepage = lazy(() => import('@/page/homepage'));

export const SIGN_IN = '/signIn';

const routes: Array<Routes> = [
  {
    path: SIGN_IN,
    Components: SignIn,
  },
  {
    path: '/',
    Components: Homepage,
    auth: true,
  },
  {
    path: '*',
    redirect: SIGN_IN,
  },
];

export default routes;
