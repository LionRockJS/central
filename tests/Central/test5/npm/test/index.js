import * as url from 'node:url';
import Central from '../../../../../classes/Central';
Central.addNodeModule( url.fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '') );

export {
  Central
};