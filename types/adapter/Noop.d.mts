export default abstract class Noop {
    resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean;
    dirname(file?: string | null): string;
    import(pathToFile: string, cacheId?: number): Promise<any>;
    fileExists(pathToFile: string): boolean;
    process(): any;
}
