import { ControllerMixin } from '@lionrockjs/mvc';
export declare enum ActionLoggerState {
    LOG_ACTIONS = "logActions",
    LOG_ACTIONS_ALL = "logActionsAll"
}
export default class ActionLogger extends ControllerMixin {
    static init(state: Map<string, any>): void;
    static before(state: Map<string, any>): Promise<void>;
}
