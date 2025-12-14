import { ControllerMixin, Controller, ControllerState } from '@lionrockjs/mvc';
import mime from 'mime';

export default class Mime extends ControllerMixin {
  static init(state: Map<string, any>): void {
    const headers = state.get(ControllerState.HEADERS);
    const request = state.get(ControllerState.REQUEST);
    headers['Content-Type'] = `${mime.getType(request.url) || 'text/html'}; charset=utf-8`;
  }
}