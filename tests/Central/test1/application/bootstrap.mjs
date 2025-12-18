import Central from '../../../../src/Central.mts';
import Test from '../modules/test';

Central.addModules([Test]);
await Central.initConfig(new Map([
  ['site', await import('./config/site.mjs?')],
]));