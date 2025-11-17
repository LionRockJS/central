import {View} from "@lionrockjs/mvc";

export default class HelperCache{
  static cacheId: number = 0;
  static classPath: Map<string, any> = new Map(); // {'ORM'          => 'APP_PATH/classes/ORM.mjs'}
  static viewPath: Map<string, string> = new Map(); // {'layout/index' => 'APP_PATH/views/layout/index'}

  static async init(): Promise<void> {
    this.clearImportCache();
  }

  static clearClassPathStrings(): void {
    //remove all cached classPath that is string
    this.classPath.forEach((v, k) => {
      if (typeof v !== 'string')return;
      this.classPath.delete(k);
    });
  }

  static clearImportCache(): void {
    this.cacheId++;
    this.clearClassPathStrings();
  }

  static clearViewCache(): void {
    this.viewPath.clear();
  }
}