import { ControllerMixin, ControllerState } from '@lionrockjs/mvc';
import mime from 'mime';
export default class Mime extends ControllerMixin {
    constructor() {
        super();
    }
    static init(state) {
        const headers = state.get(ControllerState.HEADERS);
        const request = state.get(ControllerState.REQUEST);
        headers['Content-Type'] = `${mime.getType(request.url) || 'text/html'}; charset=utf-8`;
    }
}
