/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import Central from './Central.mjs';
import Model from './Model.mjs';

/**
 * ORM option.
 * @typedef {object} ORMOption
 * @property {Database} [database] - The database to use.
 * @property {DatabaseAdapter} [adapter] - Database adapter for SQLite, MariaDB, postgresql, etc.
 * @property {string} [insertID] - The ID of the record will be inserted.
 * @property {number} [limit] - The limit of the record to read.
 * @property {number} [offset] - The offset of the record to read.
 * @property {string} [orderBy] - The order of the record to read.
 * @property {boolean} [asArray] - Return the result as an array.
 * @property {string[]} [columns] - The columns to read.
 */

export default class ORM {
  static classPrefix = 'model/';

  /**
   * @param {typeof Model} MClass
   * @param {...ORMOption} options
   * @returns {Model}
   */
  static create(MClass, options = {}) {
    return new MClass(null, options);
  }

  /**
   * Create and read data from database
   * @param {typeof Model} MClass
   * @param id
   * @param {...ORMOption} options
   * @returns {Promise< Model | null >}
   */
  static async factory(MClass, id, options = {}) {
    const m = new MClass(id, options);
    await m.read(options.columns);
    return m;
  }

  static #collection(MClass, options = {}) {
    const m = ORM.create(MClass, options);
    return m.getCollection();
  }

  static async #readResult(result, m, creator, asArray){
    if (asArray) return result.map(creator);
    if (result.length === 0) return null;
    if (result.length === 1) return Object.assign(m, result[0]);
    return result.map(creator);
  }

  // Collection methods
  /**
   * read all records from the model
   * @param {typeof Model} MClass
   * @param {...ORMOption} options
   * @returns {Promise< Model[] | Model | null >}
   */
  static async readAll(MClass, options = {}) {
    const m = ORM.create(MClass, options);
    const result = await m.getCollection().readAll(options.columns);

    return this.#readResult(result, m, x => Object.assign(ORM.create(MClass, options), x), options.asArray);
  }

  /**
   *
   * @param {typeof Model} MClass
   * @param {string} key
   * @param {string[] | number[]} values
   * @param {{database: *, asArray: boolean}} options
   * @returns {Promise< Model[] | Model | null >}
   */
  static async readBy(MClass, key, values, options = {}) {
    const m = ORM.create(MClass, options);
    const result = await m.getCollection().readBy(key, values, options.columns) || [];

    return this.#readResult(result, m, x => Object.assign(ORM.create(MClass, options), x), options.asArray);
  }

  /**
   * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
   * @param {typeof Model} MClass
   * @param {[string[]]} criteria
   * @param {...ORMOption} options
   * @returns {Promise< Model[] | Model | null >}
   */
  static async readWith(MClass, criteria = [], options = {}) {
    if (criteria.length === 0) return [];
    const m = ORM.create(MClass, options);
    const result = await m.getCollection().readWith(criteria, options.columns) || [];
    return this.#readResult(result, m, x => Object.assign(ORM.create(MClass, options), x), options.asArray);
  }

  /**
   *
   * @param {typeof Model} MClass
   * @param {...ORMOption} options
   * @returns {Promise<number>}
   */
  static async countAll(MClass, options = {}) {
    return await this.#collection(MClass, options).countAll();
  }

  /**
   *
   * @param {typeof Model} MClass
   * @param {string} key
   * @param {string[]} values
   * @param {...ORMOption} options
   * @returns {Promise<number>}
   */
  static async countBy(MClass, key, values, options = {}) {
    return await this.#collection(MClass, options).countBy(key, values);
  }

  /**
   * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
   * @param {typeof Model} MClass
   * @param {[string[]]} criteria
   * @param {...ORMOption} options
   * @returns {Promise<number>}
   */
  static async countWith(MClass, criteria, options = {}) {
    if (!criteria || criteria.length === 0) throw new Error(`${MClass.constructor.name} count with no criteria`);

    return await this.#collection(MClass, options).countWith(criteria);
  }

  /**
   *
   * @param {typeof Model} MClass
   * @param {...ORMOption} options
   * @returns {Promise<void>}
   */
  static async deleteAll(MClass, options = {}) {
    await this.#collection(MClass, options).deleteAll(options.kv);
  }

  /**
   *
   * @param {typeof Model} MClass
   * @param {string} key
   * @param {string|number[]} values
   * @param {...ORMOption} options
   * @returns {Promise<void>}
   */
  static async deleteBy(MClass, key, values, options = {}) {
    await this.#collection(MClass, options).deleteBy(key, values);
  }

  /**
   * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
   * @param {typeof Model} MClass
   * @param {[string[]]}criteria
   * @param {...ORMOption} options
   * @returns {Promise<void>}
   */
  static async deleteWith(MClass, criteria, options = {}) {
    if (!criteria || criteria.length === 0) throw new Error(`${MClass.name} delete with no criteria`);

    const m = ORM.create(MClass, options);
    return m.getCollection().deleteWith(criteria);
  }

  /**
   * @param {typeof Model} MClass
   * @param {Map} kv
   * @param {Map} columnValues
   * @param {...ORMOption} options
   */
  static async updateAll(MClass, kv, columnValues, options = {}) {
    const m = ORM.create(MClass, options);
    await m.getCollection().updateAll(kv, columnValues);
  }

  /**
   *
   * @param {typeof Model} MClass
   * @param {...ORMOption} options
   * @param {string} key
   * @param {[]} values
   * @param {Map} columnValues
   * @returns {Promise<void>}
   */
  static async updateBy(MClass, key, values, columnValues, options = {}) {
    const m = ORM.create(MClass, options);
    return m.getCollection().updateBy(key, values, columnValues);
  }

  /**
   * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
   * @param {typeof Model} MClass
   * @param {...ORMOption} options
   * @param {[[string]]}criteria
   * @param {Map} columnValues
   * @returns {Promise<*>}
   */
  static async updateWith(MClass, criteria, columnValues, options = {}) {

    if (!criteria || criteria.length === 0) throw new Error(`${MClass.name} update with no criteria`);
    if (!columnValues || columnValues.size === 0) throw new Error(`${MClass.name} update without values`);

    await this.#collection(MClass, options).updateWith(criteria, columnValues);
  }

  /**
   *
   * @param {typeof Model} MClass
   * @param {...ORMOption} options
   * @param {string[]} columns
   * @param {[String[]]} values
   * @returns {Promise<void>}
   */
  static async insertAll(MClass, columns, values, options = {}) {
    // verify columns
    columns.forEach(x => {
      if (x === 'id') return;
      if (!MClass.fields.has(x) && !MClass.belongsTo.has(x)) throw new Error(`${MClass.name} insert invalid columns ${x}`);
    });

    await this.#collection(MClass, options).insertAll(columns, values);
  }

  /**
   *
   * @param modelName
   * @param defaultMClass
   * @returns {Promise<typeof Model>}
   */
  static async import(modelName, defaultMClass=Model){
    try{
      return await Central.import(ORM.classPrefix + modelName);
    }catch(e){
      if(defaultMClass === Model)throw e;
      return defaultMClass;
    }
  }

  /**
   *
   * @param {Model[]} orms
   * @param {Object} eagerLoadOptions
   * @returns {Promise<ORM[]>}
   */
  static async eagerLoad(orms, eagerLoadOptions){
    if(orms.length < 1)return [];
    if(!eagerLoadOptions.with)return [];
    await Promise.all(
      orms.map(async it => {
        await it.eagerLoad(eagerLoadOptions);
      })
    );
  }
}

Object.freeze(ORM.prototype);