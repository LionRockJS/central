/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import HelperCache from "./helper/central/Cache.mjs";
import HelperBootstrap from "./helper/central/Bootstrap.mjs";
import HelperConfig from "./helper/central/Config.mjs";
import HelperPath from "./helper/central/Path.mjs";

import AdapterNode from "./adapter/Node.mjs";

export default class Central {
  static EXE_PATH = null;
  static APP_PATH = null;
  static VIEW_PATH = null;

  static ENV = '';
  static ENV_DEVE = 'dev';
  static ENV_TEST = 'uat';
  static ENV_STAG = 'stg';
  static ENV_PROD = 'prd';

  static config = HelperConfig.config;
  static nodePackages = HelperPath.nodePackages;
  static classPath = HelperCache.classPath;
  static viewPath = HelperCache.viewPath;

  static adapter = AdapterNode;

  static async init(opts = {}) {
    const options = {
      EXE_PATH: null,
      APP_PATH: null,
      VIEW_PATH: null,
      modules: [],
      ...opts,
    };

    await HelperPath.init(options.EXE_PATH, options.APP_PATH, options.VIEW_PATH, options.modules);
    await HelperCache.init();
    await HelperConfig.init();
    await this.applyApplicationConfigs();
    await HelperBootstrap.init();
    await this.reloadModuleInit(true);

    return Central;
  }

  static async applyApplicationConfigs(){
    //apply application configs
    await Promise.all(
      Object.keys(Central.config).map(async key => {
        //fs check file exist in ${APP_PATH}/config/${key}.mjs
        //if exists, apply to Central.config[key]
        const source = `${Central.APP_PATH}/config/${key}.mjs`;
        const exist = this.adapter.fileExists(source);

        if(exist){
          const config = await this.adapter.import(source, HelperCache.cacheId);
          Object.assign(Central.config[key], config);
        }
      })
    );
  }

  /**
   *
   * @param {Map} configMap
   */
  static async initConfig(configMap) {
    await HelperConfig.addConfig(configMap);
    await this.applyApplicationConfigs();
  }

  static async flushCache() {
    if (Central.config.classes.cache !== true) {
      HelperCache.clearImportCache();
      await HelperConfig.init();
      await this.reloadConfig();
      await this.reloadModuleInit();
    }
    if (Central.config.view.cache !== true) HelperCache.clearViewCache();
  }

  static async import(pathToFile) {
    // pathToFile may include file extension;
    const adjustedPathToFile = /\..*$/.test(pathToFile) ? pathToFile : `${pathToFile}.mjs`;

    // if explicit set classPath to Class or required object, just return it.
    const c = HelperCache.classPath.get(adjustedPathToFile);
    if (c && typeof c !== 'string') return c;

    const file = HelperPath.resolve(adjustedPathToFile, 'classes', HelperCache.classPath);
    return await this.adapter.import(file, HelperCache.cacheId);
  }

  static resolveView(pathToFile) {
    return HelperPath.resolve(pathToFile, 'views', HelperCache.viewPath);
  }

  static log(args, verbose = true) {
    if(Central.ENV === Central.ENV_PROD && Central.config?.system?.debug !== true)return args;
    if(verbose === false){
      console.log(args);
      return;
    }
    console.trace(args);
  }

  //add modules to a set of filename, load config, then run init.mjs in each dirname
  static async addModules(modules){
    await HelperPath.addModules(modules);
    await this.applyApplicationConfigs();
  }

  //module may add after init, so we need to force reload module init
  static async reloadModuleInit(force=false){
    if(force === false && Central.config.classes.cache)return;
    await HelperPath.reloadModuleInit();
  }

  static async reloadConfig(){
    const configKeys = Object.keys(Central.config);
    for(let i = 0; i < configKeys.length; i++){
      const configKey = configKeys[i];
      const packages = [...HelperPath.nodePackages.values()];

      for(let j= 0; j< packages.length; j++){
        const dir = packages[j];
        const configFile = `${dir}/config/${configKey}.mjs`;
        const exist = this.adapter.fileExists(configFile);
        if (exist) {
          const config = await this.adapter.import(configFile, HelperCache.cacheId);
          Central[configKey] = Object.assign(Central.config[configKey], config.default || config);
        }
      }
    }

    await this.applyApplicationConfigs();
  }
}