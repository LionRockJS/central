import { ControllerMixin } from '@lionrockjs/mvc';
export declare enum ControllerMixinViewState {
    PLACEHOLDER = "placeHolder",
    VIEW_CLASS = "viewClass",
    THEME_PATH = "themePath",
    LAYOUT = "layout",
    LAYOUT_FILE = "layoutPath",
    TEMPLATE = "template",
    ERROR_TEMPLATE = "errorTemplate",
    LAYOUT_DEFAULT_DATA = "layoutDefaultData",
    VIEW_DEFAULT_DATA = "viewDefaultData"
}
export default class ControllerMixinView extends ControllerMixin {
    #private;
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
