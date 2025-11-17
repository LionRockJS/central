export default class HelperPath {
    static nodePackages: Set<string>;
    static init(EXE_PATH?: string | null, APP_PATH?: string | null, VIEW_PATH?: string | null, modules?: any[]): Promise<void>;
    static reloadModuleInit(): Promise<void>;
    static setCentralDefaultPaths(EXE_PATH?: string | null, APP_PATH?: string | null, VIEW_PATH?: string | null): void;
    static resolve(pathToFile: string, prefixPath: string, store: Map<string, any>, forceUpdate?: boolean): string;
    static addModules(modules: any[]): Promise<void>;
}
