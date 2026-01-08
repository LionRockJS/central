export default class HelperConfig {
    constructor();
    static init(config: object): Promise<void>;
    static addConfig(config: object, configMap: Map<string, any>): Promise<void>;
}
