import fs from 'node:fs';
import path from 'node:path';

import * as url from 'node:url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');

import Noop from './Noop.mjs';

export default class extends Noop{
  static resolveFetchList(x, store, pathToFile){
    if ( fs.existsSync(path.normalize(x)) !== true ) return false;
    return super.resolveFetchList(x, store, pathToFile);
  }

  static dirname(){
    return __dirname;
  }
}