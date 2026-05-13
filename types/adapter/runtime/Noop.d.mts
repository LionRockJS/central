export default abstract class Noop {
    resolveFetchList(x: string, store: Map<string, any>, pathToFile: string): boolean;
    dirname(file?: string | null): string;
    import(pathToFile: string, cacheId?: number): Promise<any>;
    fileExists(pathToFile: string): boolean;
    isDirectory(pathToFile: string): boolean;
    readDir(pathToFile: string): string[];
    joinPath(...parts: string[]): string;
    relativePath(from: string, to: string): string;
    extname(filePath: string): string;
    process(): any;
}
