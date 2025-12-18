import Central from '../../../../src/Central.mts';

Central.addModules([
  await import('../modules/test/index.js')
])