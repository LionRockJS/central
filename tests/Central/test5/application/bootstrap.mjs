import Central from '../../../../classes/Central.mjs';
Central.addModules([
  await import('../npm/test/index.js'),
]);