export const PACKAGE_NAME = {
  pnpm: 'pnpm-lock.yaml',
  yarn: 'yarn.lock',
  npm: 'package-lock.json',
};
export type PackageType = keyof typeof PACKAGE_NAME;
export const RENAME_FILES = {
  _gitignore: '.gitignore',
};
