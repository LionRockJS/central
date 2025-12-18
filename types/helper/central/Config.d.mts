export default class HelperConfig {
    config: any;
    init(): Promise<void>;
    addConfig(configMap: Map<string, any>): Promise<void>;
}
