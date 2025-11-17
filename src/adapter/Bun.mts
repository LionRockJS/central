import fs from 'node:fs';
import path from 'node:path';

import Node from './Node.mjs';
import Os from "node:os";

export default class Bun extends Node{
  static resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean {
    return super.resolveFetchList(x, store, pathToFile);
  }

  static fileExists(pathToFile: string): boolean {
    return super.fileExists(pathToFile);
  }

  static dirname(file: string | null = null): string {
    return super.dirname(file);
  }

  static async import(pathToFile: string, cacheId: number = 0): Promise<any> {
    const module = await import(pathToFile);
    return module.default || module;
  }
}