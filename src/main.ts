#!/usr/bin/env node

/* eslint-disable no-console */
import minimist from 'minimist';
import path from 'path';
import prompts from 'prompts';
import validate from 'validate-npm-package-name';
import fs from 'fs-extra';
import { spawnSync, execSync } from 'child_process';
import os from 'os';

import { blue, green, red } from 'kolorist';
import { version } from '../package.json';

const IS_TEST = process.env.NODE_ENV === 'test';

const templateAll = [
  {
    name: 'base',
    value: 'base',
    color: blue,
  },
];
const templateValues = templateAll.map((f) => f.name);

const caller = (code?: string) => {
  if (!code) {
    return null;
  }
  // npm/8.1.3 node/v16.13.0 win32 x64 workspaces/false
  // pnpm/6.32.1 npm/? node/v16.13.0 win32 x64
  const reg = /([\w\W]+?)\//;
  const name = (code.match(reg) || ['', 'npm'])[1];
  return name;
};

const pull = (packageNmae?: string) => {
  /*
   * 考虑加速到镜像加速 https://zhuanlan.zhihu.com/p/430580607
   */
  const url = 'https://registry.npmmirror.com';

  switch (packageNmae) {
    case 'pnpm':
      return `pnpm install --registry ${url}`;

    case 'yarn':
      return `yarn install --registry ${url}`;

    default:
      return `npm install --registry ${url}`;
  }
};

const getLockPath = (packageNmae: string, template: string) => {
  let lockName = '';
  const filePath = [os.tmpdir(), `template${version}`, template];
  switch (packageNmae) {
    case 'yarn':
      lockName = 'yarn.lock';
      break;
    default:
      lockName = 'package-lock.json';
  }
  filePath.push(lockName);
  return {
    filePath: path.join(...filePath),
    lockName,
  };
};

/*
 * 将lock文件复制到临时目录下，加速安装
 */
const copyLockFile = async (packageNmae: string, dest: string, template: string) => {
  if (packageNmae === 'pnpm') {
    return;
  }
  const { filePath, lockName } = getLockPath(packageNmae, template);

  if (!fs.existsSync(filePath)) {
    return;
  }
  await fs.copy(filePath, path.join(dest, lockName));
};

const writeLockFile = async (packageNmae: string, cwd: string, template: string) => {
  if (packageNmae === 'pnpm') {
    return;
  }
  const { filePath, lockName } = getLockPath(packageNmae, template);
  await Promise.all([fs.remove(path.join(cwd, 'pnpm-lock.yaml')), fs.copy(path.join(cwd, lockName), filePath)]);
};

const app = async () => {
  interface Argv {
    _: [string];
    template?: boolean | string;
  }
  interface Info {
    dir?: string;
    template?: string;
    mode: string;
  }
  const argv = minimist(process.argv.slice(2)) as Argv;
  const info: Info = {
    mode: caller(process.env.npm_config_user_agent) || 'npm',
  };
  const [dir] = argv._;
  const { template } = argv;

  if (argv._[0]) {
    info.dir = dir;
  }
  // 如果为true则直接选择第一项

  info.template = typeof template === 'boolean' ? templateValues[0]! : template;

  /*
   * 初始化信息完成
   */
  const selectValue = await prompts(
    [
      {
        type: () => {
          if (info.dir) {
            return null;
          }
          return 'text';
        },
        message: '请输入项目名称',
        name: 'dir',
      },
      /*
       * 如果项目存在，校验输出的名称是否符合要求
       */
      {
        type: (_, { dir: dirName }) => {
          const name = dirName || info.dir;
          const result = validate(name);
          const arr = [...(result.warnings || []), ...(result.errors || [])];
          if (arr.length) {
            throw new Error(`输入的项目名称不符合 npm 包命名规范\n${arr[0]}`);
          }
          return null;
        },
        name: 'dirCheck',
      },
      {
        type: (_, { dir: dirName }) => {
          const name = dirName || info.dir;
          if (fs.existsSync(path.join(process.cwd(), name))) {
            return 'toggle';
          }
          return null;
        },
        message: `当前项目已经存在，是否删除`,
        name: 'existence',
        initial: true,
        active: 'yes',
        inactive: 'no',
      },
      {
        type: (_, { existence }) => {
          if (existence === false) {
            throw new Error(`取消删除`);
          }
          return null;
        },
        name: 'sigin',
      },
      {
        type: () => {
          if (!info.template || !templateValues.includes(info.template)) {
            return 'select';
          }
          return null;
        },
        choices: templateAll.map((f) => ({
          title: f.color(f.name),
          value: f.value,
        })),
        name: 'template',
        message: () => {
          if (info.template) {
            return `请选择项目类型（当前指定的${info.template}不存在）`;
          }
          return '请选择项目类型';
        },
      },
    ],
    {
      onCancel: () => {
        throw new Error(`退出选择`);
      },
    },
  );
  const mergeValue = {
    ...info,
    ...selectValue,
  };
  /*
   * 对操作具体实现
   */
  if (mergeValue.existence === true) {
    fs.removeSync(path.join(process.cwd(), mergeValue.dir));
  }

  const cwd = path.join(process.cwd(), mergeValue.dir);

  await Promise.all([
    fs.copy(path.join(__dirname, `template-${mergeValue.template}`), cwd),
    // 需要考虑到lock文件加速
    copyLockFile(mergeValue.mode, cwd, mergeValue.template),
  ]);
  const install = async () => {
    const codeString = pull(mergeValue.mode);
    const spawnResult = spawnSync(codeString, { cwd, stdio: 'inherit', shell: true });
    if (spawnResult.error) {
      throw spawnResult.error;
    }
    await Promise.all([writeLockFile(mergeValue.mode, cwd, mergeValue.template), fs.remove(path.join(cwd, '.git'))]);
    try {
      execSync('git init');
      execSync('git add .');
    } catch {
      //
    }
  };

  /*
   * 测试环境跳过安装
   */
  if (!IS_TEST) {
    await install();
  }

  console.log(green(`安装完成，快进入${mergeValue.dir}目录进行开发吧`));
};

app().catch((e) => {
  console.error(red(e?.message || e));
});
