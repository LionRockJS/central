import fs from 'node:fs/promises';
import { ControllerMixin, ControllerState } from '@lionrockjs/mvc';
import Central from '../Central.mjs';

export enum ActionLoggerState {
  LOG_ACTIONS = 'logActions',
  LOG_ACTIONS_ALL = 'logActionsAll'
}

export default class ActionLogger extends ControllerMixin {
  static init(state: Map<string, any>): void {
    if (!state.get(ActionLoggerState.LOG_ACTIONS)) {
      state.set(ActionLoggerState.LOG_ACTIONS, new Set(['update', 'delete', 'read', 'import', 'export', 'upload_post']));
    }
  }

  // log needs to read session, it is created in mixinSession.before()
  static async before(state: Map<string, any>): Promise<void> {
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

      const logPath = Central.config.admin?.logPath;
      if (!logPath) return; // Skip if no log path is configured

      const logDir = `${logPath}/${YYYY}/${MONTH}/`;
      const file = `${logDir}/${DATE}.admin.log`;

      try {
        // recursive: true ensures no error if the directory already exists
        await fs.mkdir(logDir, { recursive: true });

        const session = request.session || {};
        const user = session.logged_in ? (session.user_id || session.user_role) : 'not logged in';

        const data = {
          time: `${HH}:${MM}:${SS}`,
          user: user,
          ip: state.get(ControllerState.CLIENT_IP),
          params: state.get(ControllerState.PARAMS),
        };

        await fs.appendFile(file, `${JSON.stringify(data)}\n`);
      } catch (err) {
        console.error('ActionLogger failed to write log:', err);
      }
    }
  }
}