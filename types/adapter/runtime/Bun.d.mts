import Node from './Node.mjs';
export default class Bun extends Node {
    constructor();
    resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean;
    fileExists(pathToFile: string): boolean;
    dirname(file?: string | null): string;
    import(pathToFile: string, cacheId?: number): Promise<any>;
    process(): any;
}
