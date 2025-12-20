export default class HelperPath {
    static init(nodePackages: Set<string>, EXE_PATH?: string | null, APP_PATH?: string | null, VIEW_PATH?: string | null, modules?: any[]): Promise<void>;
    static reloadModuleInit(nodePackages: any): Promise<void>;
    static resolve(nodePackages: Set<string>, pathToFile: string, prefixPath: string, store: Map<string, any>, forceUpdate?: boolean): string;
    static addModules(nodePackages: any, modules: any[]): Promise<void>;
}
