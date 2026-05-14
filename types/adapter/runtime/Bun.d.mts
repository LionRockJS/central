import Node from './Node.mjs';
export default class Bun extends Node {
    constructor();
    registerControllers(controllerDir: any): Promise<void>;
    registerViews(options: {
        package: string;
        path: string;
    }): Promise<void>;
    resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean;
    fileExists(pathToFile: string): boolean;
    dirname(file?: string | null): string;
    import(pathToFile: string, cacheId?: number): Promise<any>;
    process(): any;
}
