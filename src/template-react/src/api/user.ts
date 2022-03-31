/*
 * 注意，以下接口纯为模拟使用
 */

import _ from 'lodash-es';

const sleep = (time: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

const TOKEN = 'xxxxxx';

export const verification = async (token: string) => {
  await sleep(_.random(0, 1000));
  if (TOKEN === token) {
    return true;
  }
  throw new Error(`验证失败`);
};

export interface FormValues {
  userName: string;
  password: string;
}
export const signIn = async (info: FormValues) => {
  await sleep(_.random(0, 1000));
  if (_.isEqual(info, { userName: 'admin', password: '123456' })) {
    return TOKEN;
  }
  throw new Error(`用户名或者密码错误!`);
};
