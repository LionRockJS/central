import Central from '../../../../classes/Central.mjs';
Central.addNodeModules([
  await import('../modules/test/index.js')
])