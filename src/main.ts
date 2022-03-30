#!/usr/bin/env node

/* eslint-disable no-console */
import minimist from 'minimist';
import path from 'path';
import prompts from 'prompts';
import validate from 'validate-npm-package-name';
import fs from 'fs-extra';
import { spawnSync, execSync } from 'child_process';
import { green, red, yellow, cyan } from 'kolorist';
import { PackageType, PACKAGE_NAME, RENAME_FILES } from './constant';
import { caller, pullCode, lockDirPath, gitExists } from './utils';

const IS_TEST = process.env.NODE_ENV === 'test';

const TEMPLATE_ALL = [
  {
    name: 'base',
    value: 'base',
    color: yellow,
  },
  {
    name: 'react',
    value: 'react',
    color: cyan,
  },
] as const;
const TEMPLATE_VALUES = TEMPLATE_ALL.map((f) => f.name);

const getLockPath = (packageNmae: PackageType, template: string) => {
  const lockName = PACKAGE_NAME[packageNmae];
  return {
    filePath: path.join(lockDirPath(`${template}/${lockName}`)),
    lockName,
  };
};

/*
 * 将lock文件复制到临时目录下，加速安装
 */
const copyLockFile = async (packageNmae: PackageType, dest: string, template: string) => {
  // 收集当前模板存在什么lock文件
  const files = fs.readdirSync(dest);
  const result = Object.entries(PACKAGE_NAME).reduce((obj, [name, value]) => {
    const o = obj;
    o[name] = files.includes(value);
    return o;
  }, {} as Record<PackageType, boolean>);
  // 将出了选择安装方式外的lock文件移动走
  await Promise.all(
    Object.keys(result)
      .filter((f) => f !== packageNmae)
      .map((key) => {
        const name = PACKAGE_NAME[key];
        const src = path.join(dest, name);
        return (async () => {
          if (!fs.existsSync(src)) {
            return;
          }
          await fs.move(src, lockDirPath(`${template}/${name}`));
        })();
      }),
  );

  if (result[packageNmae]) {
    return;
  }
  const { filePath, lockName } = getLockPath(packageNmae, template);
  if (!fs.existsSync(filePath)) {
    return;
  }
  await fs.copy(filePath, path.join(dest, lockName));
};

/*
 * 将安装完成的lock文件上传到临时文件夹下，加速使用
 */
const writeLockFile = async (packageNmae: PackageType, cwd: string, template: string) => {
  const { filePath, lockName } = getLockPath(packageNmae, template);
  await Promise.all([fs.remove(path.join(cwd, '.git')), fs.copy(path.join(cwd, lockName), filePath)]);
};

const app = async () => {
  interface Argv {
    _: [string];
    template?: boolean | string;
  }
  interface Info {
    dir?: string;
    template?: string;
    mode: PackageType;
  }
  const argv = minimist(process.argv.slice(2)) as Argv;
  const info: Info = {
    mode: caller(),
  };
  const [dir] = argv._;
  const { template } = argv;

  if (argv._[0]) {
    info.dir = dir;
  }
  // 如果为true则直接选择第一项

  info.template = typeof template === 'boolean' ? TEMPLATE_VALUES[0] : template;

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
          if (!info.template || !TEMPLATE_VALUES.includes(info.template as any)) {
            return 'select';
          }
          return null;
        },
        choices: TEMPLATE_ALL.map((f) => ({
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

  await fs.copy(path.join(__dirname, `template-${mergeValue.template}`), cwd);
  // 需要考虑到lock文件加速
  await copyLockFile(mergeValue.mode, cwd, mergeValue.template);
  // 特殊文件需要更改名称
  await Object.entries(RENAME_FILES).map(([name, value]) => fs.rename(path.join(cwd, name), path.join(cwd, value)));
  const install = async () => {
    const codeString = pullCode(mergeValue.mode);
    const spawnResult = spawnSync(codeString, { cwd, stdio: 'inherit', shell: true });
    if (spawnResult.error) {
      throw spawnResult.error;
    }
    await writeLockFile(mergeValue.mode, cwd, mergeValue.template);
    const result = gitExists();
    if (result) {
      execSync('git init', { cwd, stdio: 'ignore' });
      execSync('git add .', { cwd, stdio: 'ignore' });
      // 初始化git钩子
      execSync('npx husky install', { cwd, stdio: 'ignore' });
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
