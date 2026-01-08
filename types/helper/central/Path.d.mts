export default class HelperPath {
    constructor();
    modules: Map<string, any>;
    private loader;
    private viewLoader;
    get fileList(): Map<string, string>;
    get templateList(): Map<string, string>;
    init(EXE_PATH: string, APP_PATH?: string | null, VIEW_PATH?: string | null, modules?: any[]): void;
    reloadModuleInit(): Promise<void>;
    resolve(pathToFile: string): string;
    resolveView(viewName: string): string;
    addModules(modules: any[]): void;
}
