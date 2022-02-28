import { useEffect } from 'react';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

function NprogressRoute() {
  useEffect(() => {
    nprogress.start();
    return () => {
      nprogress.done();
    };
  });
  return null;
}

export default NprogressRoute;
