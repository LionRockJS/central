import {View} from "@lionrockjs/mvc";

export default class HelperCache{
  static cacheId = 0;
  static classPath = new Map(); // {'ORM'          => 'APP_PATH/classes/ORM.mjs'}
  static viewPath = new Map(); // {'layout/index' => 'APP_PATH/views/layout/index'}

  static async init(){
    this.clearImportCache();
  }

  static clearClassPathStrings(){
    //remove all cached classPath that is string
    this.classPath.forEach((v, k) => {
      if (typeof v !== 'string')return;
      this.classPath.delete(k);
    });
  }

  static clearImportCache(){
    this.cacheId++;
    this.clearClassPathStrings();
  }

  static clearViewCache(){
    this.viewPath.clear();
  }
}