import { ControllerMixin } from '@lionrockjs/mvc';
export default class ActionLogger extends ControllerMixin {
    static LOG_ACTIONS: string;
    static LOG_ACTIONS_ALL: string;
    static init(state: Map<string, any>): void;
    static before(state: Map<string, any>): Promise<void>;
}
