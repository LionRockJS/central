/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */


// KohanaJS is singleton
import { View } from '@lionrockjs/mvc';
import NoopAdapter from './adapter/Noop';

export default class Central {
  static adapter = NoopAdapter;

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

  static nodePackages = new Set();

  static classPath = new Map(); // {'ORM'          => 'APP_PATH/classes/ORM.mjs'}

  static viewPath = new Map(); // {'layout/index' => 'APP_PATH/views/layout/index'}

  static configPath = new Map(); // {'site.mjs       => 'APP_PATH/config/site.mjs'}

  static bootstrap = {};

  static addNodeModules(modules) {
    modules.forEach(it=>{
      if(!it)return;

      const dirname = it.dirname || it.default?.dirname;
      if(!dirname)return;
      this.nodePackages.add(this.adapter.normalize(dirname));
    });
  }

  static async init(opts = {}) {
    const options = {
      EXE_PATH: null,
      APP_PATH: null,
      VIEW_PATH: null,
      ...opts,
    };

    this.#cacheId ++;

    this.#configs = new Set();
    this.classPath = new Map();
    this.viewPath = new Map();
    this.nodePackages = new Set();

    // set paths
    this.#setPath(options);
    try{
      const bootstrap = await import(`${this.APP_PATH}/bootstrap.mjs?r=${this.#cacheId}`);
      this.bootstrap = bootstrap.default || bootstrap;
    }catch(e){
      //suppress error when bootstrap.mjs not found
      if(e.constructor.name !== 'ModuleNotFoundError')throw e;
    }

    this.initConfig(new Map([
      ['classes', await import('../config/classes.mjs')],
      ['view', await import('../config/view.mjs')],
    ]));

    await this.#reloadModuleInit();

    return Central;
  }

  static #setPath(opts) {
    this.EXE_PATH = opts.EXE_PATH   || this.adapter.dirname();
    this.APP_PATH = opts.APP_PATH   || `${this.EXE_PATH}/application`;
    this.VIEW_PATH = opts.VIEW_PATH || `${this.EXE_PATH}/views`;
  }

  /**
   *
   * @param {Map} configMap
   */
  static initConfig(configMap) {
    configMap.forEach((v, k) => {
      this.#configs.add(k);
      if(!v)return;

      const existConfigSource = Central.#configSources.get(k);
      Central.#configSources.set(k, { ...existConfigSource, ...v });
    });

    this.#updateConfig().then();
  }

  static async #reloadModuleInit() {
    const initFiles = [...this.nodePackages.keys()].map(x => this.adapter.normalize(`${x}/init.mjs`));
    await Promise.all(
      initFiles.map(async it => {
        //suppress error when package without init.mjs
        try{
          await import(`${it}?r=${this.#cacheId}`)
        }catch(e){}
      })
    );
  }

  static async flushCache() {
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
    if (c && typeof c !== 'string') return c;


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
      if (prefixPath === 'views')fetchList.push(`${this.VIEW_PATH}/${pathToFile}`);
      fetchList.push(`${this.APP_PATH}/${prefixPath}/${pathToFile}`);
      fetchList.push(pathToFile);

      // load from node_modules and modules
      fetchList.push(`${this.SYS_PATH}/${prefixPath}/${pathToFile}`);
      [...this.nodePackages].reverse().forEach(x => fetchList.push(`${x}/${prefixPath}/${pathToFile}`));

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
        Object.assign(Central.config[key], await this.import(file ));
      }catch(e){
        //config file not found;
      }
    }));
  }

  static #clearRequireCache() {
    this.#cacheId++;
    this.classPath.forEach((v, k) => {
      if (typeof v !== 'string')return;
      this.classPath.delete(k);
    });

    this.configPath = new Map();
  }

  static #clearViewCache() {
    this.viewPath = new Map();
    View.DefaultViewClass.clearCache();
  }
}
