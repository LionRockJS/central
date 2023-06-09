import Central from '../../../../classes/Central.mjs';
Central.addNodeModules([
  await import('../npm/test/index.js'),
]);