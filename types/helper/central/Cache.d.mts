export default class HelperCache {
    constructor();
    static cacheId: number;
    static init(): Promise<void>;
    static clearImportCache(): void;
}
