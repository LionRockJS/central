import Central from '../../../../src/Central.mts';
import Test from '../modules/test';
import Test2 from '../modules/test2';

Central.addModules([Test, Test2]);

await Central.initConfig(new Map([
  ['site', await import('./config/site.mjs')],
]));