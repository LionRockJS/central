export default class HelperCache{
  constructor() {}
  static cacheId: number = 0;

  static async init(): Promise<void> {
    this.clearImportCache();
  }

  static clearImportCache(): void {
    this.cacheId++;
  }
}