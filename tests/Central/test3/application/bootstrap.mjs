import Central from '../../../../classes/Central.mjs';
Central.addNodeModules([
  await import('../../test1/modules/test/index.js'),
])