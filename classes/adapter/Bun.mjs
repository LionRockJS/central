import fs from 'node:fs';
import path from 'node:path';

import Noop from './Noop.mjs';

export default class Bun extends Noop{
  static resolveFetchList(x, store, pathToFile){
    if ( fs.existsSync(path.normalize(x)) !== true ) return false;
    return super.resolveFetchList(x, store, pathToFile);
  }

  static fileExists(pathToFile){
    return fs.existsSync(pathToFile);
  }

  static dirname(){
    return import.meta.dir;
  }

  static async import(pathToFile, cacheId=0){
    let qs = `?r=${cacheId}`;
    if(cacheId === 0)qs = '?';
    const fileURL = pathToFile + qs;
    console.log(fileURL);
    const module = await import(fileURL);
    return module.default || module;
  }
}