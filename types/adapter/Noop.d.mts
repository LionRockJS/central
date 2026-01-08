export default abstract class Noop {
    static resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean;
    static dirname(): string;
    static import(pathToFile: string, cacheId?: number): Promise<any>;
    static fileExists(pathToFile: string): boolean;
    static process(): any;
}
