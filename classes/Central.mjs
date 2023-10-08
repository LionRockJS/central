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

  static configForceUpdate = true;
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
      ...opts,
    };

    await HelperPath.init(options.EXE_PATH, options.APP_PATH, options.VIEW_PATH);
    await HelperCache.init();
    await HelperBootstrap.init();
    await HelperConfig.init();
    await this.#reloadModuleInit();

    return Central;
  }

  static addNodeModules(modules) {
    HelperPath.addNodeModules(modules);
  }

  /**
   *
   * @param {Map} configMap
   */
  static initConfig(configMap) {
    HelperConfig.addConfig(configMap).then();
  }

  static async #reloadModuleInit() {
    const initFiles = [...this.nodePackages.keys()].map(x => `${x}/init.mjs`);
    await Promise.all(
      initFiles.map(async it => {
        //suppress error when package without init.mjs
        try{
          await import(`${it}?r=${HelperCache.cacheId}`)
        }catch(e){}
      })
    );
  }

  static async flushCache() {
    if (this.configForceUpdate) await HelperConfig.update();
    if (!HelperConfig.config.classes?.cache) {
      HelperCache.clearImportCache();
      this.configPath = new Map();
    }
    if (!HelperConfig.config.view?.cache) HelperCache.clearViewCache();
    if (!HelperConfig.config.classes?.cache) await this.#reloadModuleInit();
  }

  static async import(pathToFile) {
    // pathToFile may include file extension;
    const adjustedPathToFile = /\..*$/.test(pathToFile) ? pathToFile : `${pathToFile}.mjs`;

    // if explicit set classPath to Class or required object, just return it.
    const c = HelperCache.classPath.get(adjustedPathToFile);
    if (c && typeof c !== 'string') return c;


    const file = HelperPath.resolve(adjustedPathToFile, 'classes', HelperCache.classPath);
    const {default: d} = await HelperImport.importAbsolute(file + '?r=' + HelperCache.cacheId);

    return d;
  }

  static resolveView(pathToFile) {
    return HelperPath.resolve(pathToFile, 'views', HelperCache.viewPath);
  }

}