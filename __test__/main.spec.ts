import path from 'path';
import { commandSync, SyncOptions } from 'execa';
import fs from 'fs-extra';

const CLI_PATH = path.join(__dirname, '../src/main.ts');

const name = 'test-app';
const getPath = path.join(__dirname, name);

const temporary = async () => {
  await fs.ensureDir(getPath);
  await fs.writeJson(path.join(getPath, 'package.json'), { name: 'test' });
};

const run = (args: Array<string>, options?: SyncOptions<string>) =>
  commandSync(`ts-node ${CLI_PATH} ${args.join(' ')}`, options);

beforeAll(async () => {
  await fs.remove(getPath);
});
afterEach(async () => {
  await fs.remove(getPath);
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
  const baseFiles = fs.readdirSync(path.join(CLI_PATH, '../template-base')).sort();
  const newBaseFiles = fs.readdirSync(getPath).sort();
  expect(newBaseFiles).toEqual(baseFiles);
});
