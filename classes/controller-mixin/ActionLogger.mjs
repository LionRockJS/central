import fs from 'node:fs';
import { ControllerMixin, ControllerState } from '@lionrockjs/mvc';
import Central from '../Central.mjs';
export var ActionLoggerState;
(function (ActionLoggerState) {
    ActionLoggerState["LOG_ACTIONS"] = "logActions";
    ActionLoggerState["LOG_ACTIONS_ALL"] = "logActionsAll";
})(ActionLoggerState || (ActionLoggerState = {}));
export default class ActionLogger extends ControllerMixin {
    static init(state) {
        if (!state.get(ActionLoggerState.LOG_ACTIONS))
            state.set(ActionLoggerState.LOG_ACTIONS, new Set(['update', 'delete', 'read', 'import', 'export', 'upload_post']));
    }
    //log need to read session, it create in mixinSession.before()
    static async before(state) {
        const logActions = state.get(ActionLoggerState.LOG_ACTIONS);
        const request = state.get(ControllerState.REQUEST);
        const action = state.get(ControllerState.ACTION);
        // If logActions is null, log all actions. Otherwise, only log actions in the set.
        if (logActions === ActionLoggerState.LOG_ACTIONS_ALL || (logActions && logActions.has(action))) {
            const now = new Date();
            const YYYY = now.getFullYear();
            const MONTH = String(now.getMonth() + 1).padStart(2, '0');
            const DATE = String(now.getDate()).padStart(2, '0');
            const HH = String(now.getHours()).padStart(2, '0');
            const MM = String(now.getMinutes()).padStart(2, '0');
            const SS = String(now.getSeconds()).padStart(2, '0');
            const logDir = `${Central.config.admin.logPath}/${YYYY}/${MONTH}/`;
            const file = `${logDir}/${DATE}.admin.log`;
            //create folder if not exist
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
            const session = request.session || {};
            const user = session.logged_in ? session.user_id || session.user_role : 'not logged in';
            const data = {
                time: `${HH}:${MM}:${SS}`,
                user: user,
                ip: state.get(ControllerState.CLIENT_IP),
                params: state.get(ControllerState.PARAMS),
            };
            fs.appendFile(file, `${JSON.stringify(data)}\n`, err => { if (err)
                throw err; });
        }
    }
}
