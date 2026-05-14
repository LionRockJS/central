/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import ORM from './ORM.mjs';
import Model from './Model.mjs';
import RuntimeAdapter from './adapter/runtime/Noop.mjs';
import RuntimeAdapterNode from './adapter/runtime/Node.mjs';

interface CentralInitOptions {
  bootstrap?: any;
  import?: any;
  routes?: any;
  modules?: any[];
}

export enum CentralEnv {
  DEVELOPMENT = 'dev',
  TEST = 'uat',
  STAGING = 'stg',
  PRODUCTION = 'prd'
}

import ConfigClasses from './config/classes.mjs';
import ConfigDatabase from './config/database.mjs';
import ConfigLanguage from './config/language.mjs';
import ConfigSystem from './config/system.mjs';
import ConfigView from './config/view.mjs';

export default class Central {
  static ENV: string = '';
  static cacheId = 0;
  static modules = new Map<string, any>();

  static config:any = {
    classes: ConfigClasses,
    database: ConfigDatabase,
    language: ConfigLanguage,
    system: ConfigSystem,
    view: ConfigView,
  };

  static runtime: RuntimeAdapter = new RuntimeAdapterNode();
  static port: string = "";

  static controllerFiles = new Map<string, any>();
  static viewFiles = new Map<string, any>();
  static modelFiles = new Map<string, any>();

  static resolveController(controllerName: string) {
    return this.controllerFiles.get(controllerName);
  }

  static resolveModel(modelName: string) {
    return this.modelFiles.get(modelName);
  }

  static resolveView(pathToFile: string) {
    return this.viewFiles.get(pathToFile);
  }

  static log(args: any, verbose: boolean = true): any {
    if(Central.ENV === CentralEnv.PRODUCTION && Central.config?.system?.debug !== true)return args;
    if(verbose === false){
      console.log(args);
      return;
    }
    console.trace(args);
  }

  static addConfig(configs: Map<string, any>){
    for(const [key, value] of configs.entries()){
      if(Central.config[key] === undefined) Central.config[key] = {};
      Object.assign(Central.config[key], value.default || value);
    }
  }

  //add modules to a set of filename, load config, then run init.mjs in each dirname
  static async addModules(modules: any[]): Promise<void> {
    //loop modules, if have it.configs, add them to config
    for(const it of modules) {
      if(!it) continue;
      const configs = it.configs || it.default?.configs;

      if(configs){
        for(const key of Object.keys(configs)){
          if(Central.config[key] === undefined) Central.config[key] = {};
          Object.assign(Central.config[key], configs[key]);
        }
      }

      //loop all exports of module, if export is ORM, add to modelFiles, if export is view, add to viewFiles
      for(const exportKey of Object.keys(it)){
        const exportValue = it[exportKey];
        if(typeof exportValue === 'function' && exportValue.prototype instanceof Model){
          Central.modelFiles.set(ORM.classPrefix + exportKey.replaceAll('Model', ''), exportValue);
        }
      }
    }
  }
}