import {fileURLToPath, pathToFileURL} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import Os from "node:os";

import Noop from './Noop.mjs';
export default class Node extends Noop{
  constructor() {
    super();
  }

  override resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean {
    if(this.fileExists(x) !== true)return false;

    store.set(pathToFile, x);
    return true;
  }

  override fileExists(pathToFile: string): boolean {
    let pathToTest = pathToFile;
    if(path.extname(pathToFile) === '')pathToTest = `${pathToFile}.mjs`;

    try{
      return fs.statSync(pathToTest).isFile();
    }catch(e){
      return false;
    }
  }

  override isDirectory(pathToFile: string): boolean {
    try {
      return fs.statSync(pathToFile).isDirectory();
    } catch(e) {
      return false;
    }
  }

  override readDir(pathToFile: string): string[] {
    try {
      return fs.readdirSync(pathToFile);
    } catch(e) {
      return [];
    }
  }

  override joinPath(...parts: string[]): string {
    return path.join(...parts);
  }

  override relativePath(from: string, to: string): string {
    return path.relative(from, to);
  }

  override extname(filePath: string): string {
    return path.extname(filePath);
  }

  override dirname(file: string | null = null): string {
    return path.dirname(fileURLToPath(file || import.meta.url));
  }

  override async import(pathToFile: string, cacheId: number = 0): Promise<any> {
    let qs = `?r=${cacheId}`;
    if(cacheId === 0)qs = '';
    let importPath: string = pathToFile;
    if(Os.platform() === 'win32')importPath = pathToFileURL(pathToFile).href;
    const module = await import(importPath + qs);
    return module.default || module;
  }

  override process(): any {
    return process;
  }
}