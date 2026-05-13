import Noop from './Noop.mjs';
export default class Node extends Noop {
    constructor();
    resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean;
    fileExists(pathToFile: string): boolean;
    isDirectory(pathToFile: string): boolean;
    readDir(pathToFile: string): string[];
    joinPath(...parts: string[]): string;
    relativePath(from: string, to: string): string;
    extname(filePath: string): string;
    dirname(file?: string | null): string;
    import(pathToFile: string, cacheId?: number): Promise<any>;
    process(): any;
}
