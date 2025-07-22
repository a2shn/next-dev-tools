import { antfu } from '@antfu/eslint-config';

const common = {
  formatters: true,
  rules: {
    "n/prefer-node-protocol": ["error"]
  }
};

export const eslintConfigLib = antfu({
  type: 'lib',
  ...common,
});

export const eslintConfigReactLib = antfu({
  type: 'lib',
  react: true,
  ...common,
});

export const eslintConfigApp = antfu({
  type: 'app',
  react: true,
  ...common,
});
