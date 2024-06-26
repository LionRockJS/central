import crypto from 'node:crypto';

import { ControllerMixin } from '@lionrockjs/mvc';
import DatabaseAdapter from '../adapter/Database.mjs';
import Central from "../Central.mjs";

export default class ControllerMixinDatabase extends ControllerMixin {
  static #dbConnection = new Map();

  static DATABASE_MAP = 'databaseMap';

  static DATABASE_ADAPTER = 'databaseAdapter';

  static DATABASES = 'databases';

  static defaultAdapter = DatabaseAdapter;

  static init(state) {
    if (!state.get(this.DATABASE_MAP))state.set(this.DATABASE_MAP, new Map());
    if (!state.get(this.DATABASES))state.set(this.DATABASES, new Map());
    if (!state.get(this.DATABASE_ADAPTER))state.set(this.DATABASE_ADAPTER, this.defaultAdapter);
  }

  static async setup(state) {
    const conn = this.#getConnections(state.get(this.DATABASE_MAP), state.get(this.DATABASE_ADAPTER));
    conn.forEach((v, k) => {
      state.get(this.DATABASES).set(k, v);
    });
  }

  /**
   *
   * @param {Map} databaseMap
   * @param {Database.} driverClass
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
        Central.log(e, v, driverClass);
        throw e;
      }
    });

    connections.set('createdAt', Date.now());
    ControllerMixinDatabase.#dbConnection.set(key, connections);

    return connections;
  }
}