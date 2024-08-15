import fs from 'node:fs';
import path from 'node:path';

import * as url from 'node:url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, '');
import Os from "node:os";

import Noop from './Noop.mjs';
export default class Node extends Noop{
  static resolveFetchList(x, store, pathToFile){
    if ( fs.existsSync(path.normalize(x)) !== true ) return false;
    return super.resolveFetchList(x, store, pathToFile);
  }

  static dirname(){
    return __dirname;
  }

  static async import(pathToFile, cacheId=0){
    let qs = `?r=${cacheId}`;
    if(cacheId === 0)qs = '';
    const fixWindowsImport = (Os.type() === 'Windows_NT') ? "file://": "";
    const module = await import(fixWindowsImport + pathToFile + qs);
    return module.default || module;
  }
}