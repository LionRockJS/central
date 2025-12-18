import { ControllerMixin, ControllerState } from '@lionrockjs/mvc';
import Central from '../Central.mjs';
import { ControllerMixinViewState } from './View.mjs';
export default class ControllerMixinViewData extends ControllerMixin {
    static init(state) {
        const request = state.get(ControllerState.REQUEST);
        const client = state.get(ControllerState.CLIENT);
        const cookies = state.get(ControllerState.REQUEST_COOKIES);
        const languageNames = Central.config.language.names;
        const dataRequest = {
            host: request.headers.host,
            locale: state.get(ControllerState.LANGUAGE),
            origin: state.get(ControllerState.HOSTNAME),
            page_type: state.get('orm_model') || client.model || client.name,
            path: request.url,
            language_name: languageNames.get(state.get(ControllerState.LANGUAGE)),
            controller: request.params.controller,
            action: request.params.action,
            query: request.query,
            cookies,
        };
        Object.assign(state.get(ControllerMixinViewState.LAYOUT_DEFAULT_DATA), {
            request: dataRequest,
        });
        Object.assign(state.get(ControllerMixinViewState.VIEW_DEFAULT_DATA), {
            request: dataRequest,
        });
    }
}
