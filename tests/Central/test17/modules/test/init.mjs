import Central from '../../../../../src/Central.mts';

await Central.initConfig(new Map([
  ['cftest', await import('./config/cftest.mjs')],
]));
