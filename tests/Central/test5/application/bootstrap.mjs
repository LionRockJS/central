import Central from '../../../../dist/Central.mjs';
Central.addModules([
  await import('../npm/test/index.js'),
]);