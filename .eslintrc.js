module.exports = {
  extends: ['airbnb', 'airbnb-typescript', 'airbnb/hooks', 'prettier'],
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
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/extensions': ['.js', '.jsx', '.ts', '.tsx'],
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      typescript: {
        alwaysTryTypes: true,
        project: ['./tsconfig.json'],
      },
    },
  },
  plugins: ['prettier', 'import'],
  rules: {
    'prettier/prettier': 'error',
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['vite.config.ts'] }],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'import/no-unresolved': 'error',
  },
};
