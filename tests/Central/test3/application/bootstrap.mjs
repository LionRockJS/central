import Central from '../../../../classes/Central.mjs';
Central.addModules([
  await import('../../test1/modules/test/index.js'),
])