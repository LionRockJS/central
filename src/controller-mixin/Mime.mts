import { ControllerMixin, Controller } from '@lionrockjs/mvc';
import mime from 'mime';

export default class Mime extends ControllerMixin {
  static init(state) {
    const headers = state.get(Controller.STATE_HEADERS);
    const request = state.get(Controller.STATE_REQUEST);
    headers['Content-Type'] = `${mime.getType(request.url) || 'text/html'}; charset=utf-8`;
  }
}