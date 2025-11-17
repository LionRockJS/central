import crypto from 'node:crypto';

import { ControllerMixin } from '@lionrockjs/mvc';
import DatabaseAdapter from '../adapter/Database.mjs';
import Central from '../Central.mjs';

export default class ControllerMixinDatabase extends ControllerMixin {
  static #dbConnection: Map<string, any> = new Map();

  static DATABASE_MAP: string = 'databaseMap';

  static DATABASE_ADAPTER: string = 'databaseAdapter';

  static DATABASES: string = 'databases';

  static defaultAdapter = DatabaseAdapter;

  static init(state: Map<string, any>): void {
    if (!state.get(this.DATABASE_MAP))state.set(this.DATABASE_MAP, new Map());
    if (!state.get(this.DATABASES))state.set(this.DATABASES, new Map());
    if (!state.get(this.DATABASE_ADAPTER))state.set(this.DATABASE_ADAPTER, this.defaultAdapter);
  }

  static async setup(state: Map<string, any>): Promise<void> {
    const conn = this.#getConnections(state.get(this.DATABASE_MAP), state.get(this.DATABASE_ADAPTER));
    conn.forEach((v, k) => {
      state.get(this.DATABASES).set(k, v);
    });
  }

  /**
   *
   * @param databaseMap
   * @param driverClass
   * @returns {Map}
   */
  static #getConnections(databaseMap: Map<string, any>, driverClass: typeof DatabaseAdapter): Map<string, any> {
    const hash = crypto.createHash('sha256');
    hash.update(Array.from(databaseMap.keys()).join('') + Array.from(databaseMap.values()).join(''));
    const key = hash.digest('hex');

    const conn = ControllerMixinDatabase.#dbConnection.get(key);
    if (conn) return conn;

    const connections = new Map();
    databaseMap.forEach((v, k) => {
      try {
        connections.set(k, driverClass.create(v));
      } catch (e) {
        Central.log(e);
        Central.log(v);
        Central.log(driverClass);
        throw e;
      }
    });

    connections.set('createdAt', Date.now());
    ControllerMixinDatabase.#dbConnection.set(key, connections);

    return connections;
  }
}