export default class HelperPath {
    loader: Loader;
    get fileList(): Map<string, string>;
    get templateList(): Map<string, string>;
    get modules(): Map<string, any>;
    init(EXE_PATH?: string | null, APP_PATH?: string | null, VIEW_PATH?: string | null, modules?: any[]): void;
    reloadModuleInit(): Promise<void>;
    resolve(pathToFile: string): string;
    resolveView(viewName: string): Promise<any>;
    addModules(modules: any[]): void;
}
declare class Loader {
    modules: Map<string, any>;
    fileList: Map<string, string>;
    templateList: Map<string, string>;
    constructor();
    resolve(moduleName: string): string;
    addModule(module: any): void;
    scanDir(basePath: string, currentPath?: string): void;
    scanViewDir(basePath: string, currentPath?: string): void;
    addModules(modules: any[]): void;
}
export {};
