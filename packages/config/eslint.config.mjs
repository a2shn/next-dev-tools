import antfu from '@antfu/eslint-config';

export const eslintConfigFlat = antfu({
});

export const eslintConfigLib = antfu({
  type: 'lib',
});

export const eslintConfigReactLib = antfu({
  type: 'lib',
  react: true,
});

export const eslintConfigApp = antfu({
  type: 'app',
  react: true,
});
