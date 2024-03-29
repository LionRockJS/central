import { ControllerMixin, View } from '@lionrockjs/mvc';

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
    const client = state.get('client');
    const defaultViewData = {
      language: client.language,
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
    const layoutView = state.get(this.LAYOUT);
    if (state.get(this.LAYOUT_FILE) !== layoutView.file) {
      state.set(this.LAYOUT, this.#getView(state.get(this.LAYOUT_FILE), layoutView.data, state.get(this.THEME_PATH), state.get(this.VIEW_CLASS)));
    }
  }

  static async after(state) {
    const client = state.get('client');

    // .json return json content;
    if (/^application\/json/.test(client.headers['Content-Type'])) {
      client.body = JSON.stringify(client.body);
      return;
    }

/* depreciate, should not use mixin view if the controller no need to render */
// do not render non text content, eg, no need to render when controller read protected pdf
//    if (client.headers['Content-Type'] && /^text/.test(client.headers['Content-Type']) === false) {
//      return;
//    }

    // render template and put into layout's main output.
    // no template, replace the controller body string into layout.
    const template = state.get(this.TEMPLATE);
    const layout = state.get(this.LAYOUT);
    layout.data[state.get(this.PLACEHOLDER)] = template ? await template.render() : client.body;
    client.body = await layout.render();
  }

  static async exit(state) {
    const client = state.get('client');
    const code = client.status;
    if (code === 302) return;
    if (client.headers && client.headers['Content-Type'] && /^application\/json/.test(client.headers['Content-Type'])) {
      client.body = JSON.stringify(client.body);
      return;
    }
    const errorTemplate = state.get(this.ERROR_TEMPLATE);
    const layout = state.get(this.LAYOUT);
    const placeHolder = state.get(this.PLACEHOLDER);

    if (errorTemplate) {
      Object.assign(errorTemplate.data, { body: client.body });
      layout.data[placeHolder] = await errorTemplate.render();
    } else {
      layout.data[placeHolder] = client.body;
    }
    client.body = await layout.render();
  }

  static #getView(path, data, themePath, ViewClass) {
    return new ViewClass(path, data, themePath);
  }
}