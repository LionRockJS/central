import Node from './Node.mjs';
export default class Bun extends Node {
    static resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean;
    static fileExists(pathToFile: string): boolean;
    static dirname(file?: string | null): string;
    static import(pathToFile: string, cacheId?: number): Promise<any>;
}
