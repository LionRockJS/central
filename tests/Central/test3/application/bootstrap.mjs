import Central from '../../../../dist/Central.mjs';
Central.addModules([
  await import('../../test1/modules/test/index.js'),
])