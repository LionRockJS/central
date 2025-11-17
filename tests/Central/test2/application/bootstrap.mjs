import Central from '../../../../dist/Central.mjs';

Central.addModules([
  await import('../modules/test/index.js')
])