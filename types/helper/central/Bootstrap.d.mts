export default class HelperBootstrap {
    constructor();
    static loadID: number;
    static init(adapter: any, APP_PATH: string): Promise<void>;
    static loadRoutes(adapter: any, APP_PATH: string): Promise<void>;
}
