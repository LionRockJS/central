import Central from '../../../../classes/Central.mjs';

Central.addModules([
  await import('../modules/test/index.js')
])