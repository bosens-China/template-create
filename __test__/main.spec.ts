import path from 'path';
import { commandSync, SyncOptions } from 'execa';
import fs from 'fs-extra';
import { lockDirPath } from '../src/utils';

const CLI_PATH = path.join(__dirname, '../src/main.ts');

const name = 'test-app';
const getPath = path.join(__dirname, name);

const temporary = async () => {
  await fs.ensureDir(getPath);
  await fs.writeJson(path.join(getPath, 'package.json'), { name: 'test' });
};

const RENAME_FILES = {
  _gitignore: '.gitignore',
};

const getReaddirSync = (dest) =>
  fs
    .readdirSync(dest)
    .map((f) => {
      if (RENAME_FILES[f]) {
        return RENAME_FILES[f];
      }
      return f;
    })
    .sort();

const run = (args: Array<string>, options?: SyncOptions<string>) =>
  commandSync(`ts-node ${CLI_PATH} ${args.join(' ')}`, options);

const remove = async () => {
  await Promise.all([fs.remove(getPath), fs.remove(lockDirPath(''))]);
};

beforeAll(async () => {
  process.env.npm_config_user_agent = 'npm/8.1.3 node/v16.13.0 win32 x64 workspaces/false';
  await remove();
});
afterEach(async () => {
  await remove();
});

test(`项目名称输入`, () => {
  const { stdout } = run([]);
  expect(stdout).toContain('请输入项目名称');
});

test(`项目名称测试`, () => {
  const { stderr } = run(['@bas']);
  expect(stderr).toContain(`输入的项目名称不符合 npm 包命名规范`);
});

test(`项目目录存在提示`, async () => {
  await temporary();
  const { stdout } = run([name], { cwd: __dirname });
  expect(stdout).toContain('当前项目已经存在，是否删除');
});

test('选择项目类型', () => {
  const { stdout } = run([name]);
  expect(stdout).toContain('请选择项目类型');
});

test('无效项目类型重新选择', () => {
  const { stdout } = run([name, '--template=vue1'], { cwd: __dirname });
  expect(stdout).toContain('请选择项目类型');
});

test('普通安装', () => {
  const { stdout } = run([name, '--template=base'], { cwd: __dirname });
  expect(stdout).toContain('安装完成');
  const baseFiles = getReaddirSync(path.join(CLI_PATH, '../template-base')).sort();
  /*
   * 因为设置了npm变量，所以pnpm-lock会被删除
   */
  const newBaseFiles = ['pnpm-lock.yaml', ...getReaddirSync(getPath)].sort();
  expect(newBaseFiles).toEqual(baseFiles);
});

test('测试lock文件存留情况', () => {
  run([name, '--template=base'], { cwd: __dirname });
  expect(fs.existsSync(path.join(getPath, 'pnpm-lock.yaml'))).toBeFalsy();
  expect(fs.existsSync(path.join(getPath, 'yarn.lock'))).toBeFalsy();
  expect(fs.existsSync(path.join(getPath, 'package-lock.json'))).toBeFalsy();
  // 同时也要测试缓存文件是否存在
  expect(fs.existsSync(lockDirPath('base/pnpm-lock.yaml'))).toBeTruthy();
});
