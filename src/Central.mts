/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import HelperCache from './helper/central/Cache.mjs';
import HelperBootstrap from './helper/central/Bootstrap.mjs';
import HelperConfig from './helper/central/Config.mjs';
import HelperPath from './helper/central/Path.mjs';
import AdapterNoop from './adapter/Noop.mjs';

import AdapterNode from './adapter/Node.mjs';
import system from './config/system.mjs';

interface CentralInitOptions {
  EXE_PATH?: string | null;
  APP_PATH?: string | null;
  VIEW_PATH?: string | null;
  modules?: any[];
}

export enum CentralEnv {
  DEVELOPMENT = 'dev',
  TEST = 'uat',
  STAGING = 'stg',
  PRODUCTION = 'prd'
}

export default class Central {
  static EXE_PATH: string | null = null;
  static APP_PATH: string | null = null;
  static VIEW_PATH: string | null = null;

  static ENV: string = '';

  static config:any = {
    classes: {
      cache : true
    },
    view: {
      cache : true
    },
    system: {
      debug: false
    }
  };

  static adapter:AdapterNoop = new AdapterNode();
  static port: string = "";

  static get modules() { return this.helperPath.modules; }
  static get classPath() { return this.helperPath.fileList; }
  static get viewPath() { return this.helperPath.templateList; }

  private static helperPath = new HelperPath();

  static async init(opts: CentralInitOptions = {}): Promise<typeof Central> {
    const options = {
      EXE_PATH: this.adapter.process().cwd(),
      APP_PATH: null,
      VIEW_PATH: null,
      modules: [],
      ...opts,
    };

    if(!options.EXE_PATH) throw new Error('Central.init requires EXE_PATH option');

    Object.keys(this.config).forEach(key => delete this.config[key]);

    await HelperConfig.init(this.config);
    this.helperPath.init(options.EXE_PATH, options.APP_PATH, options.VIEW_PATH, options.modules);

    await HelperCache.init();
    await this.applyApplicationConfigs();

    await HelperBootstrap.init(this.adapter, this.APP_PATH);
    await this.helperPath.reloadModuleInit();

    await HelperBootstrap.loadRoutes(this.adapter, this.APP_PATH);

    return Central;
  }

  static async applyApplicationConfigs(): Promise<void> {
    //apply application configs
    await Promise.all(
      Object.keys(Central.config).map(async key => {
        //fs check file exist in ${APP_PATH}/config/${key}.mjs
        //if exists, apply to Central.config[key]
        const source = `${Central.APP_PATH}/config/${key}`;
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
   * @param configMap
   */
  static async initConfig(configMap: Map<string, any>): Promise<void> {
    await HelperConfig.addConfig(this.config, configMap);
    await this.applyApplicationConfigs();
  }

  static async import(pathToFile: string): Promise<any> {
    // pathToFile may include file extension;
    const adjustedPathToFile = /\..*$/.test(pathToFile) ? pathToFile : `${pathToFile}.mjs`;

    const file = this.helperPath.resolve(adjustedPathToFile);

    if (!file) {
      throw new Error(`Resolve path error: path ${adjustedPathToFile}.mjs not found. prefixPath: classes , store: {} `);
    }
    if(typeof file !== 'string') return file;
    return await this.adapter.import(file, HelperCache.cacheId);
  }

  static resolveView(pathToFile: string): string {
    return this.helperPath.resolveView(pathToFile);
  }

  static log(args: any, verbose: boolean = true): any {
    if(Central.ENV === CentralEnv.PRODUCTION && Central.config?.system?.debug !== true)return args;
    if(verbose === false){
      console.log(args);
      return;
    }
    console.trace(args);
  }

  //add modules to a set of filename, load config, then run init.mjs in each dirname
  static async addModules(modules: any[]): Promise<void> {
    this.helperPath.addModules(modules);
    await this.helperPath.reloadModuleInit();

    //loop modules, if have it.configs, add them to config
    for(const it of modules) {
      if(!it) continue;
      const configs = it.configs || it.default?.configs;
      const filename = it.filename || it.default?.filename;
      if(!filename) continue;
      const dirname = this.adapter.dirname(filename);

      if(configs){
         const configMap = new Map<string, any>();

        for(const configName of configs) {
          const configPath = `${dirname}/config/${configName}.mjs`;
          if(this.adapter.fileExists(configPath)){
            const configModule = await this.adapter.import(configPath, HelperCache.cacheId);
            configMap.set(configName, configModule);
          }
        }

        if(configMap.size > 0) {
          await HelperConfig.addConfig(this.config, configMap);
        }
      }
    }

    await this.applyApplicationConfigs();
  }

  //module may add after init, so we need to force reload module init
  static async reloadModuleInit(force: boolean = false): Promise<void> {
    if(force === false && Central.config.classes.cache)return;
    await this.helperPath.reloadModuleInit();
  }

  static async reloadConfig(): Promise<void> {
    const configKeys = Object.keys(Central.config);
    for(let i = 0; i < configKeys.length; i++){
      const configKey = configKeys[i];
      const packages = [...this.helperPath.modules.keys()];

      for(let j= 0; j< packages.length; j++){
        const dir = packages[j];
        const configFile = `${dir}/config/${configKey}`;
        const exist = this.adapter.fileExists(configFile);
        if (exist) {
          const config = await this.adapter.import(configFile, HelperCache.cacheId);
          Central[configKey] = Object.assign(Central.config[configKey], config.default || config);
        }
      }
    }

    await this.applyApplicationConfigs();
  }

  static async flushCache(): Promise<void> {
    HelperCache.clearImportCache();
    if(this.config.classes.cache === false) await this.reloadConfig();
  }
}