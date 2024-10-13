import fs from 'node:fs';
import path from 'node:path';
import Os from "node:os";

import Noop from './Noop.mjs';
export default class Node extends Noop{
  static resolveFetchList(x, store, pathToFile){
    try{
      if ( fs.statSync(path.normalize(x)).isFile() !== true ) return false;
    }catch(e){
      return false;
    }

    return super.resolveFetchList(x, store, pathToFile);
  }

  static fileExists(pathToFile){
    try{
      return fs.statSync(pathToFile).isFile();
    }catch(e){
      return false;
    }
  }

  static dirname(file=null){
    const name = path.dirname(file || import.meta.url);
    //remove protocol
    return name.replace(/^[^:]+:\/\//i, '');
  }

  static async import(pathToFile, cacheId=0){
    let qs = `?r=${cacheId}`;
    if(cacheId === 0)qs = '';
    const fixWindowsImport = (Os.type() === 'Windows_NT') ? "file://": "";
    const module = await import(fixWindowsImport + pathToFile + qs);
    return module.default || module;
  }
}