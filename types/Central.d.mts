/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import RuntimeAdapter from './adapter/runtime/Noop.mjs';
export declare enum CentralEnv {
    DEVELOPMENT = "dev",
    TEST = "uat",
    STAGING = "stg",
    PRODUCTION = "prd"
}
export default class Central {
    static ENV: string;
    static cacheId: number;
    static modules: Map<string, any>;
    static config: any;
    static runtime: RuntimeAdapter;
    static port: string;
    static controllerFiles: Map<string, any>;
    static viewFiles: Map<string, any>;
    static modelFiles: Map<string, any>;
    static resolveController(controllerName: string): any;
    static resolveModel(modelName: string): any;
    static resolveView(pathToFile: string): any;
    static log(args: any, verbose?: boolean): any;
    static addConfig(configs: Map<string, any>): void;
    static addModules(modules: any[]): Promise<void>;
}
