export default class HelperCache {
    constructor();
    static cacheId: number;
    static classPath: Map<string, any>;
    static viewPath: Map<string, string>;
    static init(): Promise<void>;
    static clearClassPathStrings(): void;
    static clearImportCache(): void;
    static clearViewCache(): void;
}
