import Noop from './Noop.mjs';
export default class Worker extends Noop{
  constructor() {
    super();
  }

  override resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean {
    // no filesystem in CF Workers — trust the path and add to store
    store.set(pathToFile, x);
    return true;
  }

  override fileExists(pathToFile: string): boolean {
    // no filesystem access in CF Workers
    return false;
  }

  override dirname(file: string | null = null): string {
    return new URL('.', file || import.meta.url).pathname;
  }

  override async import(pathToFile: string, cacheId: number = 0): Promise<any> {
    // CF Workers: dynamic import only works for bundled modules; no query-string cache busting
    const module = await import(pathToFile);
    return module.default || module;
  }

  override process(): any {
    return super.process();
  }
}