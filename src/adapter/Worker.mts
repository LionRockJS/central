import Noop from './Noop.mjs';
export default class Worker extends Noop{
  constructor() {
    super();
  }

  static resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean {
    // no filesystem in CF Workers — trust the path and add to store
    store.set(pathToFile, x);
    return true;
  }

  static fileExists(pathToFile: string): boolean {
    // no filesystem access in CF Workers
    return false;
  }

  static dirname(file: string | null = null): string {
    return new URL('.', file || import.meta.url).pathname;
  }

  static async import(pathToFile: string, cacheId: number = 0): Promise<any> {
    // CF Workers: dynamic import only works for bundled modules; no query-string cache busting
    const module = await import(pathToFile);
    return module.default || module;
  }

  static process(): Record<string, never> {
    return {};
  }
}