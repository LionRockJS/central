import { ControllerMixin } from '@lionrockjs/mvc';
export default class ControllerMixinView extends ControllerMixin {
    #private;
    static PLACEHOLDER: string;
    static VIEW_CLASS: string;
    static THEME_PATH: string;
    static LAYOUT: string;
    static LAYOUT_FILE: string;
    static TEMPLATE: string;
    static ERROR_TEMPLATE: string;
    static LAYOUT_DEFAULT_DATA: string;
    static VIEW_DEFAULT_DATA: string;
    static init(state: any): void;
    static setTemplate(state: any, file: any, data?: {}, defaultFile?: string): void;
    static setLayout(state: any, file: any, data?: {}, defaultFile?: string): void;
    static setErrorTemplate(state: any, file: any, data?: {}, defaultFile?: string): void;
    static setup(state: any): Promise<void>;
    static before(state: any): Promise<void>;
    static assignJSONView(state: any): void;
    static renderLayout(state: any): Promise<void>;
    static isSkipLayout(state: any): boolean;
    static after(state: any): Promise<void>;
    static exit(state: any): Promise<void>;
}
