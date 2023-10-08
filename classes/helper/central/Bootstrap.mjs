import HelperCache from "./Cache.mjs";
import Central from "../../Central.mjs";
import HelperImport from "./Import.mjs";

export default class HelperBootstrap{
  static async init(){
    try{
      await HelperImport.importAbsolute(`${Central.APP_PATH}/bootstrap.mjs` + `?r=${HelperCache.cacheId}`);
    }catch(e){
      //suppress error when bootstrap.mjs not found
      if(e.constructor.name !== 'ModuleNotFoundError')throw e;
    }
  }
}