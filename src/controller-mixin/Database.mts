import { ControllerMixin } from '@lionrockjs/mvc';
import DatabaseAdapter from '../adapter/Database.mjs';
import Central from '../Central.mjs';

export default class ControllerMixinDatabase extends ControllerMixin {
  constructor() {
    super();
  }

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
    const conn = await this.#getConnections(state.get(this.DATABASE_MAP), state.get(this.DATABASE_ADAPTER), state);
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
  static async #getConnections(databaseMap: Map<string, any>, driverClass: typeof DatabaseAdapter, state: Map<string, any>): Promise<Map<string, any>> {
    const raw = new TextEncoder().encode(driverClass.name + Array.from(databaseMap.keys()).join('') + Array.from(databaseMap.values()).join(''));
    const hashBuf = await crypto.subtle.digest('SHA-256', raw);
    const key = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');

    const conn = ControllerMixinDatabase.#dbConnection.get(key);
    if (conn) return conn;

    const connections = new Map();
    databaseMap.forEach((v, k) => {
      try {
        connections.set(k, driverClass.create(v, { state }));
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
