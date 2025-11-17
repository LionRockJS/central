import Central from '../../../../dist/Central.mjs';
Central.addModules([
  await import('../npm/test-module-two/index.js'),
  await import('../../test5/npm/test/index.js'),
]);