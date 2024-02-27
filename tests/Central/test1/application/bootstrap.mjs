import Central from '../../../../classes/Central.mjs';
import Test from '../modules/test';

Central.addModules([Test])

Central.initConfig(new Map([
  ['site', await import('./config/site.mjs')],
]));