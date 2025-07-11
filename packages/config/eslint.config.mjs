import antfu from '@antfu/eslint-config';

export const eslintConfigLib = antfu({
  type: 'lib',
  formatters: true,
});

export const eslintConfigReact = antfu({
  type: 'lib',
  react: true,
  formatters: true,
});

export const eslintConfigApp = antfu({
  type: 'app',
  react: true,
  formatters: true,
});
