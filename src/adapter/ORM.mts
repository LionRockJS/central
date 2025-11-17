import Central from '../Central.mjs';
import { randomUUID } from 'node:crypto';
import type Model from '../Model.mjs';

export default class ORM {
  client: Model;
  tableName: string | null;
  database: any;

  /**
   *
   * @param client
   * @param database
   */
  constructor(client: Model, database: any) {
    this.client = client;
    const ClientClass = client.constructor as typeof Model;
    this.tableName = ClientClass.tableName;
    this.database = database;

    if(this.constructor === ORM) Central.log('Using Abstract ORM adapter', false);
  }

  static defaultID(): number {
    // eslint-disable-next-line no-bitwise
    return (Math.floor((Date.now() - 1563741060000) / 1000)) * 100000 + ((Math.random() * 100000) & 65535);
  }

  static uuid(): string {
    return randomUUID({ disableEntropyCache: true });
  }

  static translateValue(values: any[]): any[] {
    return values;
  }

  processValues(): any[] {
    const columns = this.client.getColumns();
    return (this.constructor as typeof ORM).translateValue(columns.map(x => (this.client as any)[x]));
  }

  // eslint-disable-next-line class-methods-use-this
  async read(columns: string[] = this.client.getColumns()): Promise<any> {/***/}

  /**
   *
   * @param {[]} values
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async update(values) {/***/}

  /**
   *
   * @param {[]} values
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async insert(values) {/***/}

  /**
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async delete() {/***/}

  /**
   *
   * @param tableName
   * @param key
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async hasMany(tableName: string, key: string): Promise<any[]> {return [];}

  /**
   *
   * @param modelTableName
   * @param jointTableName
   * @param lk
   * @param fk
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async belongsToMany(modelTableName: string, jointTableName: string, lk: string, fk: string): Promise<any[]> {return [];}

  /**
   * add belongsToMany
   * @param {Model[]} models
   * @param {number} weight
   * @param {string} jointTableName
   * @param {string} lk
   * @param {string} fk
   */
  // eslint-disable-next-line class-methods-use-this
  async add(models, weight, jointTableName, lk, fk) {/***/}

  /**
   * remove
   * @param {ORM[]} models
   * @param {string} jointTableName
   * @param {string} lk
   * @param {string} fk
   */
  // eslint-disable-next-line class-methods-use-this
  async remove(models, jointTableName, lk, fk) {/***/}

  /**
   *
   * @param {string} jointTableName
   * @param {string} lk
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async removeAll(jointTableName, lk) {/***/}

  /**
   *
   * @param {Map} kv
   * @returns {[]}
   * @param {string[]} columns
   * @param {number} limit
   * @param {number} offset
   * @param {Map} orderBy
   * @returns {Promise<[]>}
   */
  // eslint-disable-next-line class-methods-use-this
  async readAll(kv,columns=this.client.getColumns(), limit = 1000, offset = 0, orderBy = new Map([['id', 'ASC']])) {
    return [];
  }

  /**
   *
   * @param {string} key
   * @param {[]} values
   * @param {string[]} columns
   * @param {number} limit
   * @param {number} offset
   * @param {Map} orderBy
   * @returns {Promise<[]>}
   */
  // eslint-disable-next-line class-methods-use-this
  async readBy(key, values,columns=this.client.getColumns(), limit = 1000, offset = 0, orderBy = new Map([['id', 'ASC']])) {
    return [];
  }

  /**
   *
   * @param {[[string]]}criteria
   * @param {number} limit
   * @param {string[]} columns
   * @param {number} offset
   * @param {Map} orderBy
   * @returns {Promise<[]>}
   */
  // eslint-disable-next-line class-methods-use-this
  async readWith(criteria, columns=this.client.getColumns(), limit = 1000, offset = 0, orderBy = new Map([['id', 'ASC']])) {
    return [];
  }

  /**
   * @param {Map|null} kv
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line class-methods-use-this
  async countAll(kv = null) {
    return 0;
  }

  /**
   *
   * @param {string} key
   * @param {[]} values
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line class-methods-use-this
  async countBy(key, values) {
    return 0;
  }

  /**
   *
   * @param {[[string]]}criteria
   * @returns {Promise<number>}
   */
  // eslint-disable-next-line class-methods-use-this
  async countWith(criteria) {
    return 0;
  }

  /**
   *
   * @param {Map|null} kv
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async deleteAll(kv = null) {/***/}

  /**
   *
   * @param {string} key
   * @param {[]} values
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async deleteBy(key, values) {/***/}

  /**
   *
   * @param {[[string]]}criteria
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async deleteWith(criteria) {/***/}

  /**
   *
   * @param {Map} kv
   * @param {Map} columnValues
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async updateAll(kv, columnValues) {/***/}

  /**
   *
   * @param {string} key
   * @param {[]} values
   * @param {Map} columnValues
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async updateBy(key, values, columnValues) {/***/}

  /**
   *
   * @param {[[string]]}criteria
   * @param {Map} columnValues
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async updateWith(criteria, columnValues) {/***/}

  /**
   *
   * @param {[]} columns
   * @param {[[]]} valueGroups
   * @param {number[]} ids
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async insertAll(columns, valueGroups, ids) {/***/}

}