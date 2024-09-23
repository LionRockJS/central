import { ControllerMixin, View, Controller } from '@lionrockjs/mvc';
import JSONView from '../view/JSONView.mjs';

export default class ControllerMixinView extends ControllerMixin {
  static PLACEHOLDER = 'placeHolder';

  static VIEW_CLASS = 'viewClass';

  static THEME_PATH = 'themePath';

  static LAYOUT = 'layout';

  static LAYOUT_FILE = 'layoutPath';

  static TEMPLATE = 'template';

  static ERROR_TEMPLATE = 'errorTemplate';

  static LAYOUT_DEFAULT_DATA = 'layoutDefaultData';
  static VIEW_DEFAULT_DATA = 'viewDefaultData';

  static init(state) {
    const language = state.get(Controller.STATE_LANGUAGE);
    const defaultViewData = {
      language
    };

    const defaultLayoutData = {}

    if (!state.get(this.LAYOUT_FILE))state.set(this.LAYOUT_FILE, 'layout/default');
    if (!state.get(this.PLACEHOLDER))state.set(this.PLACEHOLDER, 'main');
    if (!state.get(this.VIEW_CLASS))state.set(this.VIEW_CLASS, View.DefaultViewClass);
    if (!state.get(this.LAYOUT_DEFAULT_DATA))state.set(this.LAYOUT_DEFAULT_DATA, defaultLayoutData);
    if (!state.get(this.VIEW_DEFAULT_DATA))state.set(this.VIEW_DEFAULT_DATA, defaultViewData);
  }

  static setTemplate(state, file, data = {}, defaultFile="") {
    state.set(this.TEMPLATE, (typeof file === 'string')
      ? this.#getView(state, file, { ...state.get(this.VIEW_DEFAULT_DATA), ...data }, defaultFile)
      : file);
  }

  static setLayout(state, file, data = {}, defaultFile="") {
    state.set(this.LAYOUT, (typeof file === 'string')
      ? this.#getView(state, file, { ...state.get(this.VIEW_DEFAULT_DATA), ...state.get(this.LAYOUT_DEFAULT_DATA), ...data }, defaultFile)
      : file);
  }

  static setErrorTemplate(state, file, data = {}, defaultFile="") {
    state.set(this.ERROR_TEMPLATE, (typeof file === 'string')
      ? this.#getView(state, file, { ...state.get(this.VIEW_DEFAULT_DATA), ...data }, defaultFile)
      : file);
  }

  static async setup(state) {
  }

  static async before(state) {
    if (!state.get(this.LAYOUT))this.setLayout(state, state.get(this.LAYOUT_FILE), {});
  }

  static assignJSONView(state){
    // .json return json content;
    const headers = state.get(Controller.STATE_HEADERS);
    if (/^application\/json/.test(headers['Content-Type'])) {
      state.set(this.LAYOUT, new JSONView(state.get(this.PLACEHOLDER)))
    }
  }

  // render layout, make sure it's string and put into body.
  static async renderLayout(state){
    const layout = state.get(this.LAYOUT);
    let output = await layout.render();

    if (typeof output === 'object')output = JSON.stringify(output);
    if (typeof output !== 'string')throw new Error('Layout must be string or object');

    state.set(Controller.STATE_BODY, output);
  }

  static async after(state) {
    this.assignJSONView(state);

    // render template and put into layout's main output.
    // no template, replace the controller body string into layout.
    const template = state.get(this.TEMPLATE);
    const layout = state.get(this.LAYOUT);

    // if layout data is string, just render it.
    if(typeof layout.data !== 'string' ) layout.data[state.get(this.PLACEHOLDER)] = template ? await template.render() : state.get(Controller.STATE_BODY);
    await this.renderLayout(state);
  }

  static async exit(state) {
    if (state.get(Controller.STATE_STATUS) === 302) return;
    this.assignJSONView(state);

    const errorTemplate = state.get(this.ERROR_TEMPLATE);
    const layout = state.get(this.LAYOUT);
    const placeHolder = state.get(this.PLACEHOLDER);

    if(typeof layout.data !== 'string' ){
      if (errorTemplate) {
        Object.assign(errorTemplate.data, { body: state.get(Controller.STATE_BODY) });
        layout.data[placeHolder] = await errorTemplate.render();
      } else {
        layout.data[placeHolder] = state.get(Controller.STATE_BODY);
      }
    }

    await this.renderLayout(state);
  }

  static #getView(state, path, data, defaultFile) {
    const themePath = state.get(this.THEME_PATH) || "";
    const ViewClass = state.get(this.VIEW_CLASS);
    return new ViewClass(themePath + path, data, defaultFile);
  }
}