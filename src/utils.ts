import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import type { PackageType } from './constant';
import { version } from '../package.json';

export const caller = () => {
  const code = process.env.npm_config_user_agent;
  if (!code) {
    return 'npm';
  }
  // npm/8.1.3 node/v16.13.0 win32 x64 workspaces/false
  // pnpm/6.32.1 npm/? node/v16.13.0 win32 x64
  const reg = /([\w\W]+?)\//;
  const name = code.match(reg)?.[1];
  return (name || 'npm') as PackageType;
};

export const pullCode = (packageNmae: PackageType) => {
  /*
   * 考虑加速到镜像加速 https://zhuanlan.zhihu.com/p/430580607
   */
  const url = 'https://registry.npmmirror.com';
  return `${packageNmae} install --registry ${url}`;
};

export const lockDirPath = (template: string) => path.join(os.tmpdir(), `template${version}`, template);

/*
 * git 是否存在
 */
export const gitExists = () => {
  try {
    // 不要简写
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};
