import { ControllerMixin, View, ControllerState } from '@lionrockjs/mvc';
import JSONView from '../view/JSONView.mjs';
export var ControllerMixinViewState;
(function (ControllerMixinViewState) {
    ControllerMixinViewState["PLACEHOLDER"] = "placeHolder";
    ControllerMixinViewState["VIEW_CLASS"] = "viewClass";
    ControllerMixinViewState["THEME_PATH"] = "themePath";
    ControllerMixinViewState["LAYOUT"] = "layout";
    ControllerMixinViewState["LAYOUT_FILE"] = "layoutPath";
    ControllerMixinViewState["TEMPLATE"] = "template";
    ControllerMixinViewState["ERROR_TEMPLATE"] = "errorTemplate";
    ControllerMixinViewState["LAYOUT_DEFAULT_DATA"] = "layoutDefaultData";
    ControllerMixinViewState["VIEW_DEFAULT_DATA"] = "viewDefaultData";
})(ControllerMixinViewState || (ControllerMixinViewState = {}));
export default class ControllerMixinView extends ControllerMixin {
    constructor() {
        super();
    }
    static init(state) {
        const language = state.get(ControllerState.LANGUAGE);
        const defaultViewData = {
            language
        };
        const defaultLayoutData = {};
        if (!state.get(ControllerMixinViewState.LAYOUT_FILE))
            state.set(ControllerMixinViewState.LAYOUT_FILE, 'layout/default');
        if (!state.get(ControllerMixinViewState.PLACEHOLDER))
            state.set(ControllerMixinViewState.PLACEHOLDER, 'main');
        if (!state.get(ControllerMixinViewState.VIEW_CLASS))
            state.set(ControllerMixinViewState.VIEW_CLASS, View.DefaultViewClass);
        if (!state.get(ControllerMixinViewState.LAYOUT_DEFAULT_DATA))
            state.set(ControllerMixinViewState.LAYOUT_DEFAULT_DATA, defaultLayoutData);
        if (!state.get(ControllerMixinViewState.VIEW_DEFAULT_DATA))
            state.set(ControllerMixinViewState.VIEW_DEFAULT_DATA, defaultViewData);
        if (!state.get(ControllerMixinViewState.LAYOUT)) {
            this.setLayout(state, state.get(ControllerMixinViewState.LAYOUT_FILE), state.get(ControllerMixinViewState.LAYOUT_DEFAULT_DATA), 'layout/default');
        }
    }
    static setTemplate(state, file, data = {}, defaultFile = "") {
        state.set(ControllerMixinViewState.TEMPLATE, (typeof file === 'string')
            ? this.#getView(state, file, { ...state.get(ControllerMixinViewState.VIEW_DEFAULT_DATA), ...data }, defaultFile)
            : file);
    }
    static setLayout(state, file, data = {}, defaultFile = "") {
        state.set(ControllerMixinViewState.LAYOUT, (typeof file === 'string')
            ? this.#getView(state, file, { ...state.get(ControllerMixinViewState.VIEW_DEFAULT_DATA), ...state.get(ControllerMixinViewState.LAYOUT_DEFAULT_DATA), ...data }, defaultFile)
            : file);
    }
    static setErrorTemplate(state, file, data = {}, defaultFile = "") {
        if (typeof file === 'string') {
            state.set(ControllerMixinViewState.ERROR_TEMPLATE, this.#getView(state, file, { ...state.get(ControllerMixinViewState.VIEW_DEFAULT_DATA), ...data }, defaultFile));
        }
        else {
            state.set(ControllerMixinViewState.ERROR_TEMPLATE, file);
        }
    }
    static async setup(state) {
    }
    static async before(state) {
        if (!state.get(ControllerMixinViewState.LAYOUT))
            this.setLayout(state, state.get(ControllerMixinViewState.LAYOUT_FILE), {});
    }
    static assignJSONView(state) {
        // .json return json content;
        const headers = state.get(ControllerState.HEADERS);
        if (/^application\/json/.test(headers['Content-Type'])) {
            state.set(ControllerMixinViewState.LAYOUT, new JSONView(state.get(ControllerMixinViewState.PLACEHOLDER)));
        }
    }
    // render layout, make sure it's string and put into body.
    static async renderLayout(state) {
        const layout = state.get(ControllerMixinViewState.LAYOUT);
        let output = await layout.render();
        if (typeof output === 'object')
            output = JSON.stringify(output);
        if (typeof output !== 'string')
            throw new Error('Layout must be string or object');
        state.set(ControllerState.BODY, output);
    }
    static isSkipLayout(state) {
        const mime = state.get(ControllerState.HEADERS)['Content-Type'];
        if (!mime)
            return false;
        if (state.get(ControllerState.BODY) === null)
            return false;
        if (/\/json/.test(mime))
            return false;
        if (/^text/.test(mime))
            return false;
        if (/xml/.test(mime))
            return false;
        return true;
    }
    static async after(state) {
        if (this.isSkipLayout(state))
            return;
        this.assignJSONView(state);
        // render template and put into layout's main output.
        // no template, replace the controller body string into layout.
        const template = state.get(ControllerMixinViewState.TEMPLATE);
        const layout = state.get(ControllerMixinViewState.LAYOUT);
        // if layout data is string or no template, just render it.
        if (!template || typeof layout.data === 'string') {
            layout.data[state.get(ControllerMixinViewState.PLACEHOLDER)] = state.get(ControllerState.BODY);
            await this.renderLayout(state);
            return;
        }
        //copy layout data to template data;
        const templateData = Object.assign({}, template.data);
        const layoutData = Object.assign({}, layout.data);
        delete layoutData[state.get(ControllerMixinViewState.PLACEHOLDER)]; //remove placeholder data from layout data.
        Object.assign(template.data, layoutData);
        layout.data[state.get(ControllerMixinViewState.PLACEHOLDER)] = await template.render();
        Object.assign(layout.data, templateData);
        //after template render, template.data.meta is filled with data from json templates;
        //copy template data back to layout data;
        const metaKeys = Object.keys(template.data?.meta || {});
        if (metaKeys.length > 0) {
            layout.data.meta = {};
            metaKeys.forEach(key => {
                layout.data.meta[key] = [...template.data.meta[key].values()];
            });
        }
        await this.renderLayout(state);
    }
    static async exit(state) {
        if (state.get(ControllerState.STATUS) === 302)
            return;
        this.assignJSONView(state);
        const errorTemplate = state.get(ControllerMixinViewState.ERROR_TEMPLATE);
        const layout = state.get(ControllerMixinViewState.LAYOUT);
        const placeHolder = state.get(ControllerMixinViewState.PLACEHOLDER);
        if (typeof layout.data !== 'string') {
            if (errorTemplate) {
                Object.assign(errorTemplate.data, { body: state.get(ControllerState.BODY) });
                layout.data[placeHolder] = await errorTemplate.render();
            }
            else {
                layout.data[placeHolder] = state.get(ControllerState.BODY);
            }
        }
        await this.renderLayout(state);
    }
    static #getView(state, path, data, defaultFile) {
        const themePath = state.get(ControllerMixinViewState.THEME_PATH) || "";
        const ViewClass = state.get(ControllerMixinViewState.VIEW_CLASS);
        return new ViewClass(themePath + path, data, defaultFile);
    }
}
