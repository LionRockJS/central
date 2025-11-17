import {fileURLToPath, pathToFileURL} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import Os from "node:os";

import Noop from './Noop.mjs';
export default class Node extends Noop{
  static resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean {
    if(this.fileExists(x) !== true)return false;

    store.set(pathToFile, x);
    return true;
  }

  static fileExists(pathToFile: string): boolean {
    try{
      return fs.statSync(pathToFile).isFile();
    }catch(e){
      return false;
    }
  }

  static dirname(file: string | null = null): string {
    return path.dirname(fileURLToPath(file || import.meta.url));
  }

  static async import(pathToFile: string, cacheId: number = 0): Promise<any> {
    let qs = `?r=${cacheId}`;
    if(cacheId === 0)qs = '';
    let importPath: string | URL = pathToFile;
    if(Os.platform() === 'win32')importPath = pathToFileURL(pathToFile);
    const module = await import(importPath + qs);
    return module.default || module;
  }

  static process(): NodeJS.Process {
    return process;
  }
}