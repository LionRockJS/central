import Central from '../../../../src/Central.mts';
Central.addModules([
  await import('../npm/test/index.js'),
]);