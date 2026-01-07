interface LoaderOptions {
    ignoreList?: RegExp[];
    pathHandler?: (path: string) => string;
    keepExtension?: boolean;
}
export default class CascadeFileLoader {
    fileList: Map<string, string>;
    private ignoreList;
    private pathHandler?;
    private keepExtension;
    constructor(options?: LoaderOptions);
    scanDir(basePath: string, currentPath?: string): void;
    resolve(moduleName: string): string;
    addModule(module: any): void;
    addModules(modules: any[]): void;
}
export {};
