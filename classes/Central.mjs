/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */


// KohanaJS is singleton
import { View } from '@lionrockjs/mvc';

export default class Central {
  static adapter = {
    dirname : () => '',
    normalize : source => source,
    resolveFetchList: (x, store, pathToFile) => {
      store.set(pathToFile, x); return true;
    }
  }

  static #cacheId = 0;

  static #configs = new Set();

  static #configSources = new Map();

  static SYS_PATH = '';

  static EXE_PATH = this.SYS_PATH;

  static APP_PATH = this.SYS_PATH;

  static VIEW_PATH = this.SYS_PATH;

  static ENV = '';
  static ENV_DEVE = 'dev';
  static ENV_TEST = 'uat';
  static ENV_STAG = 'stg';
  static ENV_PROD = 'prd';

  static config = { classes: {}, view: {} };

  static configForceUpdate = true;

  static nodePackages = [];

  static classPath = new Map(); // {'ORM'          => 'APP_PATH/classes/ORM.js'}

  static viewPath = new Map(); // {'layout/index' => 'APP_PATH/views/layout/index'}

  static configPath = new Map(); // {'site.js       => 'APP_PATH/config/site.js'}

  static bootstrap = {};

  static async init(opts = {}) {
    const options = {
      EXE_PATH: null,
      APP_PATH: null,
      VIEW_PATH: null,
      ...opts,
    };

    this.#configs = new Set();
    this.classPath = new Map();
    this.viewPath = new Map();
    this.nodePackages = [];

    // set paths
    this.#setPath(options);
    await this.#loadBootStrap();

    this.initConfig(new Map([
      ['classes', await import('../config/classes.mjs')],
      ['view', await import('../config/view.mjs')],
    ]));

    await this.#reloadModuleInit();

    return Central;
  }

  static #setPath(opts) {
    Central.EXE_PATH = opts.EXE_PATH || this.adapter.dirname();
    Central.APP_PATH = opts.APP_PATH || `${Central.EXE_PATH}/application`;
    Central.MOD_PATH = opts.MOD_PATH || `${Central.APP_PATH}/modules`;
    Central.VIEW_PATH = opts.VIEW_PATH || `${Central.APP_PATH}/views`;
  }

  static async #loadBootStrap() {
    const bootstrapFile = `${Central.APP_PATH}/bootstrap.mjs`;

    try{
      await import(bootstrapFile);
    }catch(e){

    }
  }

  /**
   *
   * @param {Map} configMap
   */
  static initConfig(configMap) {
    configMap.forEach((v, k) => {
      this.#configs.add(k);

      const existConfigSource = Central.#configSources.get(k);
      if (v) Central.#configSources.set(k, { ...existConfigSource, ...v });
    });

    this.#updateConfig();
  }

  static async #reloadModuleInit() {
    await Promise.all([
      ...this.nodePackages.map(x => `${x}/init.mjs`)
    ].map(async initPath => {
      const filePath = this.adapter.normalize(initPath);
      try{
        await import(filePath + '?r=' + this.#cacheId);
      }catch(e){}
    }))
  }

  static addNodeModule(dirname) {
    this.nodePackages.push(dirname);
    return Central;
  }

  static async flushCache() {
    this.#cacheId++;

    if (this.configForceUpdate) await this.#updateConfig();
    if (!this.config.classes.cache) this.#clearRequireCache();
    if (!this.config.view.cache) this.#clearViewCache();
    if (!this.config.classes.cache) await this.#reloadModuleInit();
  }

  static async import(pathToFile) {
    // pathToFile may include file extension;
    const adjustedPathToFile = /\..*$/.test(pathToFile) ? pathToFile : `${pathToFile}.mjs`;

    // if explicit set classPath to Class or required object, just return it.
    const c = this.classPath.get(adjustedPathToFile);

    if (c && typeof c !== 'string') {
      return c;
    }

    const file = this.#resolve(adjustedPathToFile, 'classes', this.classPath);
    const {default: d} = await import(file + '?r=' + this.#cacheId);

    return d;
  }

  static resolveView(pathToFile) {
    return this.#resolve(pathToFile, 'views', this.viewPath);
  }

  // private methods
  static #resolve(pathToFile, prefixPath, store, forceUpdate = false) {
    if (/\.\./.test(pathToFile)) {
      throw new Error('invalid require path');
    }

    if (!store.get(pathToFile) || forceUpdate) {
      // search application, then modules
      const fetchList = [];
      if (prefixPath === 'views')fetchList.push(`${Central.VIEW_PATH}/${pathToFile}`);
      fetchList.push(`${Central.APP_PATH}/${prefixPath}/${pathToFile}`);
      fetchList.push(pathToFile);

      // load from app/modules
      [...Central.bootstrap.modules].reverse().forEach(x => fetchList.push(`${Central.MOD_PATH}/${x}/${prefixPath}/${pathToFile}`));

      fetchList.push(`${Central.SYS_PATH}/${prefixPath}/${pathToFile}`);
      [...Central.nodePackages].reverse().forEach(x => fetchList.push(`${x}/${prefixPath}/${pathToFile}`));

      fetchList.some(x => {
        return this.adapter.resolveFetchList(x, store, pathToFile);
      });

      if (!store.get(pathToFile)) {
        throw new Error(`KohanaJS resolve path error: path ${pathToFile} not found. prefixPath: ${prefixPath} , store: ${JSON.stringify(store)} `);
      }
    }

    return store.get(pathToFile);
  }

  static async #updateConfig() {
    Central.config = {};
    // search all config files
    await Promise.all([...Central.#configs.keys()].map(async key => {
      Central.config[key] = {...Central.#configSources.get(key)}

      const fileName = `${key}.mjs`;

      try{
        Central.configPath.set(fileName, null); // never cache config file path.
        const file = Central.#resolve(fileName, 'config', Central.configPath, true);
        Object.assign(Central.config[key], await import(file + '?r=' + this.#cacheId));
      }catch(e){
        //config file not found;
      }
    }));
  }

  static #clearRequireCache() {
    this.classPath.forEach((v, k) => {
      if (typeof v === 'string') this.classPath.delete(k);
    });

    this.configPath = new Map();
  }

  static #clearViewCache() {
    this.viewPath = new Map();
    View.DefaultViewClass.clearCache();
  }
}
