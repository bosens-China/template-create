import { extend } from 'umi-request';

const request = extend({
  prefix: '/api/v1',
  timeout: 6000,
  errorHandler: (err) => {
    throw err;
  },
});

export default request;
