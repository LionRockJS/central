import { randomUUID } from 'node:crypto';

export default class ORM {
  /**
   *
   * @param {ORM} client
   * @param {*} database
   */
  constructor(client, database) {
    this.client = client;
    this.id = client.id;
    this.tableName = client.constructor.tableName;
    this.database = database;
  }

  static defaultID() {
    // eslint-disable-next-line no-bitwise
    return (Math.floor((Date.now() - 1563741060000) / 1000)) * 100000 + ((Math.random() * 100000) & 65535);
  }

  static uuid() {
    return randomUUID({ disableEntropyCache: true });
  }

  static translateValue(values) {
    return values;
  }

  processValues() {
    const columns = this.client.getColumns();
    return this.constructor.translateValue(columns.map(x => this.client[x]));
  }

  // eslint-disable-next-line class-methods-use-this
  async read() {/***/}

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
   * @param {string} tableName
   * @param {string} key
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async hasMany(tableName, key) {/***/}

  /**
   *
   * @param {string} modelTableName
   * @param {string} jointTableName
   * @param {string} lk
   * @param {string} fk
   * @returns {Promise<void>}
   */
  // eslint-disable-next-line class-methods-use-this
  async belongsToMany(modelTableName, jointTableName, lk, fk) {/***/}

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
   * @param {number} limit
   * @param {number} offset
   * @param {Map} orderBy
   * @returns {Promise<[]>}
   */
  // eslint-disable-next-line class-methods-use-this
  async readAll(kv, limit = 1000, offset = 0, orderBy = new Map([['id', 'ASC']])) {
    return [];
  }

  /**
   *
   * @param {string} key
   * @param {[]} values
   * @param {number} limit
   * @param {number} offset
   * @param {Map} orderBy
   * @returns {Promise<[]>}
   */
  // eslint-disable-next-line class-methods-use-this
  async readBy(key, values, limit = 1000, offset = 0, orderBy = new Map([['id', 'ASC']])) {
    return [];
  }

  /**
   *
   * @param {[[string]]}criteria
   * @param {number} limit
   * @param {number} offset
   * @param {Map} orderBy
   * @returns {Promise<[]>}
   */
  // eslint-disable-next-line class-methods-use-this
  async readWith(criteria, limit = 1000, offset = 0, orderBy = new Map([['id', 'ASC']])) {
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