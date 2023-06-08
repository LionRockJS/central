const fs = await import('node:fs');
const path = await import('node:path');

import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));


export default class {
  static normalize(source){
    return path.normalize(source);
  }

  static resolveFetchList(x, store, pathToFile){
    if (fs.existsSync(path.normalize(x))) {
      store.set(pathToFile, x);
      return true;
    }
    return false;
  }
  static dirname(){
    return __dirname;
  }
}