interface LoaderOptions {
    ignoreList?: RegExp[];
    pathHandler?: (path: string) => string;
}
export default class CascadeFileLoader {
    fileList: Map<string, string>;
    private ignoreList;
    private pathHandler?;
    constructor(options?: LoaderOptions);
    private get runtime();
    scanDir(basePath: string, currentPath?: string): void;
    resolve(moduleName: string): string;
    addModule(module: any): void;
    addModules(modules: any[]): void;
}
export {};
