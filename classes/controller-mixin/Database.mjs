import crypto from 'node:crypto';

import { ControllerMixin } from '@lionrockjs/mvc';
import DatabaseDriver from '../DatabaseDriver';

export default class ControllerMixinDatabase extends ControllerMixin {
  static #dbConnection = new Map();

  static DATABASE_MAP = 'databaseMap';

  static DATABASE_DRIVER = 'databaseDriver';

  static DATABASES = 'databases';

  static DEFAULT_DATABASE_DRIVER = DatabaseDriver;

  static init(state) {
    if (!state.get(this.DATABASE_MAP))state.set(this.DATABASE_MAP, new Map());
    if (!state.get(this.DATABASES))state.set(this.DATABASES, new Map());
    if (!state.get(this.DATABASE_DRIVER))state.set(this.DATABASE_DRIVER, this.DEFAULT_DATABASE_DRIVER);
  }

  static async setup(state) {
    const conn = this.#getConnections(state.get(this.DATABASE_MAP), state.get(this.DATABASE_DRIVER));
    conn.forEach((v, k) => {
      state.get(this.DATABASES).set(k, v);
    });
  }

  /**
   *
   * @param {Map} databaseMap
   * @param {DatabaseDriver.} driverClass
   * @returns {Map}
   */
  static #getConnections(databaseMap, driverClass) {
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
        console.log(v);
        throw e;
      }
    });

    connections.set('createdAt', Date.now());
    ControllerMixinDatabase.#dbConnection.set(key, connections);

    return connections;
  }
}