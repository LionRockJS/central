import Central from '../../../../dist/Central.mjs';
import Test from '../modules/test';

await Central.addModules([Test]);
await Central.initConfig(new Map([
  ['site', await import('./config/site.mjs?')],
]));