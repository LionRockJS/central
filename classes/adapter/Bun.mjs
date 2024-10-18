import fs from 'node:fs';
import path from 'node:path';

import Node from './Node.mjs';
import Os from "node:os";

export default class Bun extends Node{
  static resolveFetchList(x, store, pathToFile){
    return super.resolveFetchList(x, store, pathToFile);
  }

  static fileExists(pathToFile){
    return super.existsSync(pathToFile);
  }

  static dirname(file=null){
    return super.dirname(file);
  }

  static async import(pathToFile, cacheId=0){
    let qs = `?r=${cacheId}`;
    if(cacheId === 0)qs = '?'; //bun import always need ?
    const fixWindowsImport = (Os.type() === 'Windows_NT') ? "file://": "";
    const module = await import(fixWindowsImport + pathToFile + qs);
    return module.default || module;
  }
}