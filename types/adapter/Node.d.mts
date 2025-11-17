import Noop from './Noop.mjs';
export default class Node extends Noop {
    static resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean;
    static fileExists(pathToFile: string): boolean;
    static dirname(file?: string | null): string;
    static import(pathToFile: string, cacheId?: number): Promise<any>;
    static process(): NodeJS.Process;
}
