export default class HelperConfig {
    static config: any;
    static init(): Promise<void>;
    static addConfigs(dirname: string, configNames?: string[]): Promise<void>;
    static addConfig(configMap: Map<string, any>): Promise<void>;
}
