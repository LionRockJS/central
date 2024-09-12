import {Central, Controller, ControllerMixin, ControllerMixinView} from '@lionrockjs/central';

export default class ControllerMixinViewData extends ControllerMixin {
  static init(state) {
    const request = state.get(Controller.STATE_REQUEST);
    const client = state.get(Controller.STATE_CLIENT);
    const cookies = state.get(Controller.STATE_REQUEST_COOKIES);

    const languageNames = Central.config.language.names;
    const domain = state.get(Controller.STATE_HOSTNAME).split(':')[0];
    console.log(request);

    const dataRequest = {
      host: request.headers.host,
      locale: state.get(Controller.STATE_LANGUAGE),
      origin: state.get(Controller.STATE_HOSTNAME),
      page_type: state.get('orm_model') || client.model || client.name,
      path: request.url,

      language_name: languageNames.get(state.get(Controller.STATE_LANGUAGE)),
      controller: request.params.controller,
      action: request.params.action,
      query: request.query,
      cookies,
    }

    Object.assign(state.get(ControllerMixinView.LAYOUT_DEFAULT_DATA), {
      request: dataRequest
    });

    Object.assign(state.get(ControllerMixinView.VIEW_DEFAULT_DATA), {
      request: dataRequest
    });
  }
}