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
import AdapterNode from './adapter/Node.mjs';
export var CentralEnv;
(function (CentralEnv) {
    CentralEnv["DEVELOPMENT"] = "dev";
    CentralEnv["TEST"] = "uat";
    CentralEnv["STAGING"] = "stg";
    CentralEnv["PRODUCTION"] = "prd";
})(CentralEnv || (CentralEnv = {}));
export default class Central {
    static EXE_PATH = null;
    static APP_PATH = null;
    static VIEW_PATH = null;
    static ENV = '';
    static config = {
        classes: {
            cache: true
        },
        view: {
            cache: true
        },
        system: {
            debug: false
        }
    };
    static classPath = HelperCache.classPath;
    static viewPath = HelperCache.viewPath;
    static adapter = AdapterNode;
    static port = "";
    static helperClassPath = new HelperPath();
    static helperViewPath = new HelperPath();
    static async init(opts = {}) {
        const options = {
            EXE_PATH: process.cwd(),
            APP_PATH: null,
            VIEW_PATH: null,
            modules: [],
            ...opts,
        };
        if (!options.EXE_PATH)
            throw new Error('Central.init requires EXE_PATH option');
        Object.keys(this.config).forEach(key => delete this.config[key]);
        await HelperConfig.init(this.config);
        this.helperClassPath.init(options.EXE_PATH, options.APP_PATH, options.VIEW_PATH, options.modules);
        await HelperCache.init();
        await this.applyApplicationConfigs();
        await HelperBootstrap.init(this.adapter, this.APP_PATH);
        await this.helperClassPath.reloadModuleInit();
        await HelperBootstrap.loadRoutes(this.adapter, this.APP_PATH);
        return Central;
    }
    static async applyApplicationConfigs() {
        //apply application configs
        await Promise.all(Object.keys(Central.config).map(async (key) => {
            //fs check file exist in ${APP_PATH}/config/${key}.mjs
            //if exists, apply to Central.config[key]
            const source = `${Central.APP_PATH}/config/${key}`;
            const exist = this.adapter.fileExists(source);
            if (exist) {
                const config = await this.adapter.import(source, HelperCache.cacheId);
                Object.assign(Central.config[key], config);
            }
        }));
    }
    /**
     *
     * @param configMap
     */
    static async initConfig(configMap) {
        await HelperConfig.addConfig(this.config, configMap);
        await this.applyApplicationConfigs();
    }
    static async flushCache() {
        if (Central.config.classes.cache !== true) {
            HelperCache.clearImportCache();
            await HelperConfig.init(this.config);
            await this.reloadConfig();
            await this.reloadModuleInit();
        }
        if (Central.config.view.cache !== true)
            HelperCache.clearViewCache();
    }
    static async import(pathToFile) {
        // pathToFile may include file extension;
        const adjustedPathToFile = /\..*$/.test(pathToFile) ? pathToFile : `${pathToFile}`;
        let cacheKey = adjustedPathToFile;
        if (!/\..*$/.test(cacheKey))
            cacheKey += '.mjs';
        if (Central.classPath.has(cacheKey)) {
            const cached = Central.classPath.get(cacheKey);
            if (typeof cached !== 'string')
                return cached;
            return await this.adapter.import(cached, HelperCache.cacheId);
        }
        const file = this.helperClassPath.resolve(adjustedPathToFile);
        if (!file) {
            throw new Error(`Resolve path error: path ${adjustedPathToFile}.mjs not found. prefixPath: classes , store: {} `);
        }
        return await this.adapter.import(file, HelperCache.cacheId);
    }
    static resolveView(pathToFile) {
        return this.helperClassPath.resolveView(pathToFile);
    }
    static log(args, verbose = true) {
        if (Central.ENV === CentralEnv.PRODUCTION && Central.config?.system?.debug !== true)
            return args;
        if (verbose === false) {
            console.log(args);
            return;
        }
        console.trace(args);
    }
    //add modules to a set of filename, load config, then run init.mjs in each dirname
    static async addModules(modules) {
        this.helperClassPath.addModules(modules);
        await this.helperClassPath.reloadModuleInit();
        //loop modules, if have it.configs, add them to config
        for (const it of modules) {
            if (!it)
                continue;
            const configs = it.configs || it.default?.configs;
            const filename = it.filename || it.default?.filename;
            if (!filename)
                continue;
            const dirname = this.adapter.dirname(filename);
            if (configs) {
                const configMap = new Map();
                for (const configName of configs) {
                    const configPath = `${dirname}/config/${configName}.mjs`;
                    if (this.adapter.fileExists(configPath)) {
                        const configModule = await this.adapter.import(configPath, HelperCache.cacheId);
                        configMap.set(configName, configModule);
                    }
                }
                if (configMap.size > 0) {
                    await HelperConfig.addConfig(this.config, configMap);
                }
            }
        }
        await this.applyApplicationConfigs();
    }
    //module may add after init, so we need to force reload module init
    static async reloadModuleInit(force = false) {
        if (force === false && Central.config.classes.cache)
            return;
        await this.helperClassPath.reloadModuleInit();
    }
    static async reloadConfig() {
        const configKeys = Object.keys(Central.config);
        for (let i = 0; i < configKeys.length; i++) {
            const configKey = configKeys[i];
            const packages = [...this.helperClassPath.modules.keys()];
            for (let j = 0; j < packages.length; j++) {
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
}
