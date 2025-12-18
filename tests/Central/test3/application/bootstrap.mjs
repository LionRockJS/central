import Central from '../../../../src/Central.mts';
Central.addModules([
  await import('../../test1/modules/test/index.js'),
])