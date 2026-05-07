import fs from 'node:fs';
import path from 'node:path';

import Node from './Node.mjs';

export default class Bun extends Node{
  constructor() {
    super();
  }

  override resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean {
    return super.resolveFetchList(x, store, pathToFile);
  }

  override fileExists(pathToFile: string): boolean {
    //if no extension, check for .ts, .mts, .mjs
    return super.fileExists(pathToFile + '.ts') || super.fileExists(pathToFile + '.mts') || super.fileExists(pathToFile) ;
  }

  override dirname(file: string | null = null): string {
    return super.dirname(file);
  }

  override async import(pathToFile: string, cacheId: number = 0): Promise<any> {
//    let path = (cacheId === 0) ? pathToFile : `${pathToFile}?cache=${cacheId}`;
    const module = await import(pathToFile);
    return module.default || module;
  }
}