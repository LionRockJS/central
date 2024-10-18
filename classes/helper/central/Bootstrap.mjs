import Central from "../../Central.mjs";

export default class HelperBootstrap{
  static loadID = 0;
  static async init(){
    try{
      await Central.adapter.import(`${Central.APP_PATH}/bootstrap.mjs`, this.loadID++);
    }catch(e){
      //suppress error when bootstrap.mjs not found
      if(e.constructor.name === 'ModuleNotFoundError')return;
      if(e.constructor.name === 'ResolveMessage')return;
      throw e;
    }
  }
}