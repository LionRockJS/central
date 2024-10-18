import {fileURLToPath, pathToFileURL} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import Os from "node:os";

import Noop from './Noop.mjs';
export default class Node extends Noop{
  static resolveFetchList(x, store, pathToFile){
    if(this.fileExists(x) !== true)return false;

    store.set(pathToFile, x);
    return true;
  }

  static fileExists(pathToFile){
    try{
      return fs.statSync(pathToFile).isFile();
    }catch(e){
      return false;
    }
  }

  static dirname(file=null){
    return path.dirname(fileURLToPath(file || import.meta.url));
  }

  static async import(pathToFile, cacheId=0){
    let qs = `?r=${cacheId}`;
    if(cacheId === 0)qs = '';
    if(Os.platform() === 'win32')pathToFile = pathToFileURL(pathToFile);
    const module = await import(pathToFile + qs);
    return module.default || module;
  }

  static process(){
    return process;
  }
}