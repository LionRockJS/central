/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */


// KohanaJS is singleton
import NoopAdapter from './adapter/Noop.mjs';

import HelperCache from "./helper/central/Cache.mjs";
import HelperImport from "./helper/central/Import.mjs";
import HelperBootstrap from "./helper/central/Bootstrap.mjs";
import HelperConfig from "./helper/central/Config.mjs";
import HelperPath from "./helper/central/Path.mjs";

export default class Central {
  static adapter = NoopAdapter;

  static EXE_PATH = null;
  static APP_PATH = null;
  static VIEW_PATH = null;
  static MOD_PATH = null;

  static ENV = '';
  static ENV_DEVE = 'dev';
  static ENV_TEST = 'uat';
  static ENV_STAG = 'stg';
  static ENV_PROD = 'prd';

  static config = HelperConfig.config;
  static nodePackages = HelperPath.nodePackages;
  static classPath = HelperCache.classPath;
  static viewPath = HelperCache.viewPath;

  static async init(opts = {}) {
    const options = {
      EXE_PATH: null,
      APP_PATH: null,
      VIEW_PATH: null,
      MOD_PATH: null,
      node_modules: [],
      ...opts,
    };

    await HelperPath.init(options.EXE_PATH, options.APP_PATH, options.VIEW_PATH, options.node_modules);
    await HelperCache.init();
    await HelperConfig.init();
    await HelperBootstrap.init();
    await HelperPath.reloadModuleInit();

    return Central;
  }

  static addModules(modules) {
    HelperPath.addModules(modules);
  }

  /**
   *
   * @param {Map} configMap
   */
  static initConfig(configMap) {
    HelperConfig.addConfig(configMap).then();
  }

  static async flushCache() {
    if (!Central.config.classes.cache) {
      HelperCache.clearImportCache();
      await HelperConfig.updateAll();
    }
    if (!Central.config.view.cache) HelperCache.clearViewCache();
    if (!Central.config.classes.cache) await HelperPath.reloadModuleInit();
  }

  static async import(pathToFile) {
    // pathToFile may include file extension;
    const adjustedPathToFile = /\..*$/.test(pathToFile) ? pathToFile : `${pathToFile}.mjs`;

    // if explicit set classPath to Class or required object, just return it.
    const c = HelperCache.classPath.get(adjustedPathToFile);
    if (c && typeof c !== 'string') return c;


    const file = HelperPath.resolve(adjustedPathToFile, 'classes', HelperCache.classPath);
    return await HelperImport.importAbsolute(file + '?r=' + HelperCache.cacheId);
  }

  static resolveView(pathToFile) {
    return HelperPath.resolve(pathToFile, 'views', HelperCache.viewPath);
  }

  static log(args) {
    if(Central.ENV === Central.ENV_PROD)return;
    console.trace(args);
  }
}