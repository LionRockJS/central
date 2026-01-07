/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import AdapterNode from './adapter/Node.mjs';
interface CentralInitOptions {
    EXE_PATH?: string | null;
    APP_PATH?: string | null;
    VIEW_PATH?: string | null;
    modules?: any[];
}
export declare enum CentralEnv {
    DEVELOPMENT = "dev",
    TEST = "uat",
    STAGING = "stg",
    PRODUCTION = "prd"
}
export default class Central {
    static EXE_PATH: string | null;
    static APP_PATH: string | null;
    static VIEW_PATH: string | null;
    static ENV: string;
    static config: any;
    static classPath: Map<string, any>;
    static viewPath: Map<string, string>;
    static adapter: typeof AdapterNode;
    static port: string;
    private static helperClassPath;
    private static helperViewPath;
    static init(opts?: CentralInitOptions): Promise<typeof Central>;
    static applyApplicationConfigs(): Promise<void>;
    /**
     *
     * @param configMap
     */
    static initConfig(configMap: Map<string, any>): Promise<void>;
    static flushCache(): Promise<void>;
    static import(pathToFile: string): Promise<any>;
    static resolveView(pathToFile: string): string;
    static log(args: any, verbose?: boolean): any;
    static addModules(modules: any[]): Promise<void>;
    static reloadModuleInit(force?: boolean): Promise<void>;
    static reloadConfig(): Promise<void>;
}
export {};
