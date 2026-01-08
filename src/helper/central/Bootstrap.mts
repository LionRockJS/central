export default class HelperBootstrap{
  constructor() {}
  static loadID: number = 0;

  static async init(adapter, APP_PATH:string): Promise<void> {
    try{
      await adapter.import(`${APP_PATH}/bootstrap`, this.loadID);
    }catch(e){
      //suppress error when bootstrap.mjs not found
      if(e.constructor.name !== 'ModuleNotFoundError' && e.constructor.name !== 'ResolveMessage'){
        throw e;
      }
    }

    try{
      await adapter.import(`${APP_PATH}/import`, this.loadID);
    }catch(e){
      //suppress error when import.mjs not found
      if(e.constructor.name !== 'ModuleNotFoundError' && e.constructor.name !== 'ResolveMessage'){
        throw e;
      }
    }

    this.loadID++;
  }

  static async loadRoutes(adapter, APP_PATH:string): Promise<void> {
    try{
      await adapter.import(`${APP_PATH}/routes`, this.loadID);
      this.loadID++;
    }catch(e){
      //suppress error when routes.mjs not found
      if(e.constructor.name === 'ModuleNotFoundError')return;
      if(e.constructor.name === 'ResolveMessage')return;
      throw e;
    }
  }
}