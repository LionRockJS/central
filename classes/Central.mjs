/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */


// KohanaJS is singleton
import { View } from '@lionrockjs/mvc';
import NoopAdapter from './adapter/Noop.mjs';
import Os from "node:os";

class HelperCache{
  static cacheId = 0;
  static classPath = new Map(); // {'ORM'          => 'APP_PATH/classes/ORM.mjs'}
  static viewPath = new Map(); // {'layout/index' => 'APP_PATH/views/layout/index'}

  static async init(){
    this.clearImportCache();
  }

  static clearClassPathStrings(){
    //remove all cached classPath that is string
    this.classPath.forEach((v, k) => {
      if (typeof v !== 'string')return;
      this.classPath.delete(k);
    });
  }

  static clearImportCache(){
    this.cacheId++;
    this.clearClassPathStrings();
  }

  static clearViewCache(){
    this.viewPath.clear();
    View.DefaultViewClass.clearCache();
  }
}

class HelperBootstrap{
  static async init(){
    try{
      const bootstrap = await Central.importAbsolute(`${Central.APP_PATH}/bootstrap.mjs` + `?r=${HelperCache.cacheId}`);
      this.bootstrap = bootstrap.default || bootstrap;
    }catch(e){
      //suppress error when bootstrap.mjs not found
      if(e.constructor.name !== 'ModuleNotFoundError')throw e;
    }
  }
}

class HelperConfig{
  static configs = new Set();
  static configSources = new Map();
  static config = { classes: {}, view: {} };
  static configPath = new Map(); // {'site.mjs       => 'APP_PATH/config/site.mjs'}

  static async init(){
    this.configs = new Set();

    await this.addConfig(new Map([
      ['classes', (await import('../config/classes.mjs')).default],
      ['view', (await import('../config/view.mjs')).default],
    ]));
  }

  static async update() {
    // search all config files
    await Promise.all([...this.configs.keys()].map(async key => {
      this.config[key] = {...this.configSources.get(key)}
      const fileName = `${key}.mjs`;

      try{
        this.configPath.set(fileName, null); // never cache config file path.
        const file = HelperPath.resolve(fileName, 'config', this.configPath, true);
        Object.assign(this.config[key], await Central.import(file ));
      }catch(e){
        //config file not found;
      }
    }));
  }

  static async addConfig(configMap) {
    configMap.forEach((v, k) => {
      this.configs.add(k);
      if(!v)return;

      const existConfigSource = this.configSources.get(k);
      this.configSources.set(k, { ...existConfigSource, ...v });
    });

    await this.update();
  }
}

class HelperPath{
  static nodePackages = new Set();

  static async init(EXE_PATH=null, APP_PATH=null, VIEW_PATH=null){
    this.nodePackages.clear();
    HelperPath.setCentralDefaultPaths(EXE_PATH, APP_PATH, VIEW_PATH);
  }

  static setCentralDefaultPaths(EXE_PATH=null, APP_PATH=null, VIEW_PATH=null){
    Central.EXE_PATH = (EXE_PATH   || Central.adapter.dirname()).replace(/\/$/, '');
    Central.APP_PATH = (APP_PATH   || `${Central.EXE_PATH}/application`).replace(/\/$/, '');
    Central.VIEW_PATH = (VIEW_PATH || `${Central.EXE_PATH}/views`).replace(/\/$/, '');
  }

  static resolve(pathToFile, prefixPath, store, forceUpdate = false) {
    if (/\.\./.test(pathToFile)) {
      throw new Error('invalid require path');
    }

    if (!store.get(pathToFile) || forceUpdate) {
      // search application, then modules
      const fetchList = [];
      if (prefixPath === 'views')fetchList.push(`${Central.VIEW_PATH}/${pathToFile}`);
      fetchList.push(`${Central.APP_PATH}/${prefixPath}/${pathToFile}`);
      fetchList.push(pathToFile);

      // load from node_modules and modules
      fetchList.push(`${Central.SYS_PATH}/${prefixPath}/${pathToFile}`);
      [...this.nodePackages].reverse().forEach(x => fetchList.push(`${x}/${prefixPath}/${pathToFile}`));

      fetchList.some(x => {
        return Central.adapter.resolveFetchList(x, store, pathToFile);
      });

      if (!store.get(pathToFile)) {
        throw new Error(`KohanaJS resolve path error: path ${pathToFile} not found. prefixPath: ${prefixPath} , store: ${JSON.stringify(store)} `);
      }
    }

    return store.get(pathToFile);
  }

  static addNodeModules(modules){
    modules.forEach(it=>{
      if(!it)return;

      const dirname = it.dirname || it.default?.dirname;
      if(!dirname)return;
      this.nodePackages.add(dirname.replace(/[/\\]+$/, ''));
    });
  }
}

export default class Central {
  static adapter = NoopAdapter;

  static SYS_PATH = '';
  static EXE_PATH = this.SYS_PATH;
  static APP_PATH = this.SYS_PATH;
  static VIEW_PATH = this.SYS_PATH;

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

  static bootstrap = {};

  static addNodeModules(modules) {
    HelperPath.addNodeModules(modules);
  }

  static async importAbsolute(path) {
    const fixWindowsImport = (Os.type() === 'Windows_NT') ? "file://": "";
    return import(fixWindowsImport + path);
  }

  static async init(opts = {}) {
    const options = {
      EXE_PATH: null,
      APP_PATH: null,
      VIEW_PATH: null,
      ...opts,
    };

    await HelperPath.init(options.EXE_PATH, options.APP_PATH, options.VIEW_PATH);
    await HelperCache.init();
    await HelperBootstrap.init();
    await HelperConfig.init();
    await this.#reloadModuleInit();

    return Central;
  }

  static setClassPath(importPath, target){
    HelperCache.classPath.set(importPath, target);
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
    const {default: d} = await this.importAbsolute(file + '?r=' + HelperCache.cacheId);

    return d;
  }

  static resolveView(pathToFile) {
    return HelperPath.resolve(pathToFile, 'views', HelperCache.viewPath);
  }

}