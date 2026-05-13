/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import Central from './Central.mjs';
import Model, { type ORMOption } from './Model.mjs';

export default class ORM {
  static classPrefix: string = 'model/';

  static create(MClass: typeof Model, options: ORMOption = {}): Model {
    return new MClass(null, options);
  }

  static async factory(MClass: typeof Model, id: string | number, options: ORMOption = {}): Promise<Model> {
    const m = new MClass(id, options);
    await m.read(options.columns);
    return m;
  }

  static #collection(MClass: typeof Model, options: ORMOption = {}) {
    const m = ORM.create(MClass, options);
    return m.getCollection();
  }

  static async #readResult(result: any[], m: Model, creator: (x: any) => Model, asArray?: boolean): Promise<Model | Model[] | null> {
    if (asArray) return result.map(creator);
    if (result.length === 0) return null;
    if (result.length === 1) return Object.assign(m, result[0]);
    return result.map(creator);
  }


  static async readAll(MClass: typeof Model, options: ORMOption = {}): Promise<Model | Model[] | null> {
    const m = ORM.create(MClass, options);
    const result = await m.getCollection().readAll(options.columns);

    return this.#readResult(result, m, x => Object.assign(ORM.create(MClass, options), x), options.asArray);
  }

  static async readBy(MClass: typeof Model, key: string, values: (string | number)[], options: ORMOption = {}) {
    const m = ORM.create(MClass, options);
    const result = await m.getCollection().readBy(key, values, options.columns) || [];

    return this.#readResult(result, m, x => Object.assign(ORM.create(MClass, options), x), options.asArray);
  }

  /**
   * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
   */
  static async readWith(MClass: typeof Model, criteria: string[][] = [], options: ORMOption = {}) {
    if (criteria.length === 0) return [];
    const m = ORM.create(MClass, options);
    const result = await m.getCollection().readWith(criteria, options.columns) || [];
    return this.#readResult(result, m, x => Object.assign(ORM.create(MClass, options), x), options.asArray);
  }

  static async countAll(MClass: typeof Model, options: ORMOption = {}) {
    return await this.#collection(MClass, options).countAll();
  }

  static async countBy(MClass: typeof Model, key: string, values: (string | number)[], options: ORMOption = {}) {
    return await this.#collection(MClass, options).countBy(key, values);
  }

  /**
   * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
   */
  static async countWith(MClass: typeof Model, criteria: string[][], options: ORMOption = {}) {
    if (!criteria || criteria.length === 0) throw new Error(`${MClass.constructor.name} count with no criteria`);

    return await this.#collection(MClass, options).countWith(criteria);
  }

  static async deleteAll(MClass: typeof Model, options: ORMOption = {}) {
    await this.#collection(MClass, options).deleteAll();
  }

  static async deleteBy(MClass: typeof Model, key: string, values: (string | number)[], options: ORMOption = {}) {
    await this.#collection(MClass, options).deleteBy(key, values);
  }

  /**
   * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
   */
  static async deleteWith(MClass: typeof Model, criteria: string[][], options: ORMOption = {}) {
    if (!criteria || criteria.length === 0) throw new Error(`${MClass.name} delete with no criteria`);

    const m = ORM.create(MClass, options);
    return m.getCollection().deleteWith(criteria);
  }

  static async updateAll(MClass: typeof Model, kv: any, columnValues: any, options: ORMOption = {}) {
    const m = ORM.create(MClass, options);
    await m.getCollection().updateAll(kv, columnValues);
  }

  static async updateBy(MClass: typeof Model, key: string, values: (string | number)[], columnValues: any, options: ORMOption = {}) {
    const m = ORM.create(MClass, options);
    return m.getCollection().updateBy(key, values, columnValues);
  }

  /**
   * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
   */
  static async updateWith(MClass: typeof Model, criteria: string[][], columnValues: any, options: ORMOption = {}) {

    if (!criteria || criteria.length === 0) throw new Error(`${MClass.name} update with no criteria`);
    if (!columnValues || columnValues.size === 0) throw new Error(`${MClass.name} update without values`);

    await this.#collection(MClass, options).updateWith(criteria, columnValues);
  }

  static async insertAll(MClass: typeof Model, columns: string[], values: any[], options: ORMOption = {}) {
    // verify columns
    columns.forEach(x => {
      if (x === 'id') return;
      if (!MClass.fields.has(x) && !MClass.belongsTo.has(x)) throw new Error(`${MClass.name} insert invalid columns ${x}`);
    });

    await this.#collection(MClass, options).insertAll(columns, values);
  }

  static async import(modelName: string, defaultMClass: typeof Model = Model): Promise<typeof Model> {
    try{
      return await Central.resolveModel(ORM.classPrefix + modelName);
    }catch(e){
      if(defaultMClass === Model)throw e;
      return defaultMClass;
    }
  }

  static async eagerLoad(orms: Model[], eagerLoadOptions: any): Promise<void> {
    if(orms.length < 1)return;
    if(!eagerLoadOptions.with)return;
    await Promise.all(
      orms.map(async it => {
        await it.eagerLoad(eagerLoadOptions);
      })
    );
  }

  static async write(model: Model): Promise<Model> {
    return model.write();
  }
}

Object.freeze(ORM.prototype);