import { ControllerMixin, View, Controller } from '@lionrockjs/mvc';

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
    if (!state.get(this.LAYOUT))this.setLayout(state, state.get(this.LAYOUT_FILE), {});
  }

  static setTemplate(state, file, data = {}) {
    state.set(this.TEMPLATE, (typeof file === 'string')
      ? this.#getView(file, { ...state.get(this.VIEW_DEFAULT_DATA), ...data }, state.get(this.THEME_PATH), state.get(this.VIEW_CLASS))
      : file);
  }

  static setLayout(state, file, data = {}) {
    state.set(this.LAYOUT, (typeof file === 'string')
      ? this.#getView(file, { ...state.get(this.VIEW_DEFAULT_DATA), ...state.get(this.LAYOUT_DEFAULT_DATA), ...data }, state.get(this.THEME_PATH), state.get(this.VIEW_CLASS))
      : file);
  }

  static setErrorTemplate(state, file, data = {}) {
    state.set(this.ERROR_TEMPLATE, (typeof file === 'string')
      ? this.#getView(file, { ...state.get(this.VIEW_DEFAULT_DATA), ...data }, state.get(this.THEME_PATH), state.get(this.VIEW_CLASS))
      : file);
  }

  static async setup(state) {
  }

  static async after(state) {
    const headers = state.get(Controller.STATE_HEADERS);

    // .json return json content;
    if (/^application\/json/.test(headers['Content-Type'])) {
      state.set(Controller.STATE_BODY, JSON.stringify(state.get(Controller.STATE_BODY)));
      return;
    }

    // render template and put into layout's main output.
    // no template, replace the controller body string into layout.
    const template = state.get(this.TEMPLATE);
    const layout = state.get(this.LAYOUT);
    layout.data[state.get(this.PLACEHOLDER)] = template ? await template.render() : state.get(Controller.STATE_BODY);
    state.set(Controller.STATE_BODY, await layout.render());
  }

  static async exit(state) {
    if (state.get(Controller.STATE_STATUS) === 302) return;

    const headers = state.get(Controller.STATE_HEADERS);
    if (headers && headers['Content-Type'] && /^application\/json/.test(headers['Content-Type'])) {
      state.set(Controller.STATE_BODY, JSON.stringify(state.get(Controller.STATE_BODY)));
      return;
    }

    const errorTemplate = state.get(this.ERROR_TEMPLATE);
    const layout = state.get(this.LAYOUT);
    const placeHolder = state.get(this.PLACEHOLDER);

    if (errorTemplate) {
      Object.assign(errorTemplate.data, { body: state.get(Controller.STATE_BODY) });
      layout.data[placeHolder] = await errorTemplate.render();
    } else {
      layout.data[placeHolder] = state.get(Controller.STATE_BODY);
    }

    state.set(Controller.STATE_BODY, await layout.render());
  }

  static #getView(path, data, themePath, ViewClass) {
    return new ViewClass(path, data, themePath);
  }
}