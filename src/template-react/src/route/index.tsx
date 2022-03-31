import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NprogressRoute from '@/components/nprogressRoute';
import routes, { SIGN_IN } from './routes';
import Authentication from './authentication';

const Router = () => (
  <BrowserRouter>
    <Suspense fallback={<NprogressRoute />}>
      <Routes>
        {routes.map((item) => {
          if ('redirect' in item) {
            return <Route path={item.path} element={<Navigate to={item.redirect} />} />;
          }
          const { path, Components, auth } = item;
          return (
            <Route
              path={path}
              element={
                <Authentication auth={auth} loginAddress={SIGN_IN}>
                  <Components />
                </Authentication>
              }
            />
          );
        })}
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default Router;
