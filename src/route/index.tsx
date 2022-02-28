import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NprogressRoute from '@/components/nprogressRoute';

const List = lazy(() => import('@/page/list'));

function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<NprogressRoute />}>
        <Routes>
          <Route path="/list" element={<List />} />
          <Route path="*" element={<List />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default Router;
