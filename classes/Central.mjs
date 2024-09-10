/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import HelperCache from "./helper/central/Cache.mjs";
import HelperImport from "./helper/central/Import.mjs";
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
    await HelperBootstrap.init();
    await this.reloadModuleInit(true);

    return Central;
  }

  /**
   *
   * @param {Map} configMap
   */
  static async initConfig(configMap) {
    await HelperConfig.addConfig(configMap);
  }

  static async flushCache() {
    if (!Central.config.classes.cache) {
      HelperCache.clearImportCache();
      await HelperConfig.init();
    }
    if (!Central.config.view.cache) HelperCache.clearViewCache();
    if (!Central.config.classes.cache) await this.reloadModuleInit();
  }

  static async import(pathToFile) {
    // pathToFile may include file extension;
    const adjustedPathToFile = /\..*$/.test(pathToFile) ? pathToFile : `${pathToFile}.mjs`;

    // if explicit set classPath to Class or required object, just return it.
    const c = HelperCache.classPath.get(adjustedPathToFile);
    if (c && typeof c !== 'string') return c;

    const file = HelperPath.resolve(adjustedPathToFile, 'classes', HelperCache.classPath);
    return await HelperImport.importAbsolute(file);
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

  //add modules to a set of dirname, then run init.mjs in each dirname
  static addModules(modules){
    HelperPath.addModules(modules);
  }

  //module may add after init, so we need to force reload module init
  static async reloadModuleInit(force=false){
    if(force === false && Central.config.classes.cache)return;
    await HelperPath.reloadModuleInit();
  }
}