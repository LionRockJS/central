import Central from '../../../../classes/Central.mjs';
import Test from '../modules/test';

Central.addModules([Test])

await Central.initConfig(new Map([
  ['site', await import('./config/site.mjs')],
]));