module.exports = {
  extends: ['airbnb-base', 'airbnb-typescript/base', 'prettier'],
  env: {
    browser: true,
    node: true,
    // mocha: true,
    jest: true,
    // jquery: true
  },
  globals: {},
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['./script/*'] }],
  },
};
