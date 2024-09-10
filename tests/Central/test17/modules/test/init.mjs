import { Central } from '@lionrockjs/central';

await Central.initConfig(new Map([
  ['cftest', await import('./config/cftest.mjs')],
]));
