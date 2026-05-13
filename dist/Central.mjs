/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import ORM from './ORM.mjs';
import Model from './Model.mjs';
import RuntimeAdapterNode from './adapter/runtime/Node.mjs';
export var CentralEnv;
(function (CentralEnv) {
    CentralEnv["DEVELOPMENT"] = "dev";
    CentralEnv["TEST"] = "uat";
    CentralEnv["STAGING"] = "stg";
    CentralEnv["PRODUCTION"] = "prd";
})(CentralEnv || (CentralEnv = {}));
import ConfigClasses from './config/classes.mjs';
import ConfigDatabase from './config/database.mjs';
import ConfigLanguage from './config/language.mjs';
import ConfigSystem from './config/system.mjs';
import ConfigView from './config/view.mjs';
export default class Central {
    static ENV = '';
    static cacheId = 0;
    static modules = new Map();
    static config = {
        classes: ConfigClasses,
        database: ConfigDatabase,
        language: ConfigLanguage,
        system: ConfigSystem,
        view: ConfigView,
    };
    static runtime = new RuntimeAdapterNode();
    static port = "";
    static viewFiles = new Map();
    static modelFiles = new Map();
    static resolveModel(modelName) {
        return this.modelFiles.get(modelName);
    }
    static resolveView(pathToFile) {
        return this.viewFiles.get(pathToFile);
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
    static addConfig(configs) {
        for (const [key, value] of configs.entries()) {
            if (Central.config[key] === undefined)
                Central.config[key] = {};
            Object.assign(Central.config[key], value.default || value);
        }
    }
    //add modules to a set of filename, load config, then run init.mjs in each dirname
    static async addModules(modules) {
        //loop modules, if have it.configs, add them to config
        for (const it of modules) {
            if (!it)
                continue;
            const configs = it.configs || it.default?.configs;
            if (configs) {
                for (const key of Object.keys(configs)) {
                    if (Central.config[key] === undefined)
                        Central.config[key] = {};
                    Object.assign(Central.config[key], configs[key]);
                }
            }
            //loop all exports of module, if export is ORM, add to modelFiles, if export is view, add to viewFiles
            for (const exportKey of Object.keys(it)) {
                const exportValue = it[exportKey];
                if (typeof exportValue === 'function' && exportValue.prototype instanceof Model) {
                    Central.modelFiles.set(ORM.classPrefix + exportKey.replaceAll('Model', ''), exportValue);
                }
            }
        }
    }
}
