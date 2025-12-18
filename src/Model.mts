/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import ORM from './ORM.mjs';
import ORMAdapter from './adapter/ORM.mjs';
import ModelCollection from './ModelCollection.mjs';
import { Model as MVCModel } from '@lionrockjs/mvc';

interface ORMOption {
  database?: any;
  adapter?: typeof ORMAdapter;
  insertID?: string | number;
  limit?: number;
  offset?: number;
  orderBy?: Map<string, string>;
  asArray?: boolean;
  columns?: string[];
  kv?: Map<string, any>;
  retry?: number;
  insertIDs?: (string | number)[];
}

export default class Model extends MVCModel{
  // ORM is abstract, joinTablePrefix and tableName is null.
  static database: any = null;

  static tableName: string | null = null;

  // associative (junction) table name prefix
  static joinTablePrefix: string | null = null;

  static fields: Map<string, any> = new Map();

  static belongsTo: Map<string, string> = new Map();

  // hasMany cannot be Map, because children models may share same fk name.
  static hasMany: [string, string][] = [];

  static belongsToMany: Set<string> = new Set();

  static classPrefix: string = 'model/';

  static defaultAdapter = ORMAdapter;

  uuid: string | null = null;

  created_at: number | null = null;

  updated_at: number | null = null;

  id: string | number | null = null;

  #database: any = null;
  #options: ORMOption = {};

  #adapter: ORMAdapter;
  #columns: string[] = [];
  #defaultSelectColumns: string[] = [];

  #collection: ModelCollection;

  /**
   * @param id
   * @param options
   * */
  constructor(id: string | number | null = null, options: ORMOption = {}) {
    super(id);

    this.#database = options.database || Model.database;
    this.#options = options;

    const Adapter = options.adapter || Model.defaultAdapter;
    this.#adapter = new Adapter(this, this.#database);

    // list all columns of the model.
    const ConcreteModel = this.constructor as typeof Model;
    this.#columns = Array.from(ConcreteModel.fields.keys());
    // add belongsTo to columns
    Array.from((this.constructor as typeof Model).belongsTo.keys()).forEach(x => this.#columns.push(x));

    this.#defaultSelectColumns = ['id', 'created_at', 'updated_at', ...this.#columns];
    this.#collection = new ModelCollection(this.#adapter, this.#options, this.#defaultSelectColumns);
  }

  /**
   *
   * @returns {ModelCollection}
   */
  getCollection(): ModelCollection {
    return this.#collection;
  }

  /**
   * columns is a list of fields and belongsTo keys.
   *
   * @returns {Array}
   */
  getColumns(): string[] {
    return this.#columns;
  }

  /**
   *
   * @param option
   * @returns {Promise<void>}
   */
  async eagerLoad(option: any = {}): Promise<void> {
    /* options format, eg product
    * {
    * with:['Product'], //1. only with Classes will be loaded, 2. pass null to skip all classses and 3. undefined will load all classes
    * default_image:{}
    * type:{}
    * vendor:{}
    * variants:{
    *  with:['Inventory', 'Media],
    *  inventories :{}
    *  media: {}
    * },
    * media:{}
    * tags:{}
    * options:{}
    * }
    * */

    //allow option with contain classes
    const optWithClasses = new Map();
    const optWith = (Array.isArray(option.with)) ? option.with.map(it => {
      if(typeof it === 'string') return it;
      optWithClasses.set(it.name, it);
      return it.name;
    }) : option.with;
    const allowClasses = (optWith !== undefined) ? new Set(optWith) : null;

    const parents: any[] = [];
    (this.constructor as typeof Model).belongsTo.forEach((v, k) => {
      if (!allowClasses.has(v)) return;

      const name = k.replace('_id', '');
      parents.push({ name, opt: option[name], key: k });
    });

    await Promise.all(
      parents.map(async p => {
        const parentOptions = Object.assign({}, this.#options)
        if(option.columns){
          parentOptions.columns = option.columns;
        }
        if(option.database){
          parentOptions.database = option.database;
        }
        const instance = await this.parent(p.key, parentOptions);
        this[p.name] = instance;
        if (!instance) return; // parent can be null
        if(p.opt)await instance.eagerLoad(p.opt);
      }),
    );

    const props: any[] = [];

    await Promise.all(
    (this.constructor as typeof Model).hasMany.map(async x => {
      const k = x[0];
      const v = x[1];

      if (!allowClasses.has(v)) return;

      const ModelClass = optWithClasses.get(v) || await ORM.import(v);
      const name = ModelClass.tableName;
      props.push({
        name, opt: option[name], key: k, model: ModelClass,
      });
    })
    )

    await Promise.all(
      props.map(async p => {
        const instances = await this.children(p.key, p.model);
        if (!instances) return;
        this[p.model.tableName] = instances;

        if(p.opt){
          await Promise.all(
            instances.map(async instance => instance.eagerLoad(p.opt)),
          );
        }
      }),
    );

    const siblings: any[] = [];
    await Promise.all(
      [...(this.constructor as typeof Model).belongsToMany.keys()].map(async x => {
        if (!allowClasses || !allowClasses.has(x)) return;

        const ModelClass = optWithClasses.get(x) || await ORM.import(x);
        const name = ModelClass.tableName;
        siblings.push({ name, opt: option[name], model: ModelClass });
      })
    );

    await Promise.all(
      siblings.map(async s => {
        const instances = await this.siblings(s.model);
        if (!instances) return;
        this[s.model.tableName] = instances;

        if(s.opt){
          await Promise.all(
            instances.map(instance => instance.eagerLoad(s.opt)),
          );
        }
      }),
    );
  }

  /**
   * get instance values which is not null
   * @returns {Map<any, any>}
   */
  #getValues(): Map<string, any> {
    const values = new Map();
    (this.constructor as typeof Model).fields.forEach((v, k) => {
      if ((this as any)[k])values.set(k, (this as any)[k]);
    });
    return values;
  }

  // instance methods

  async writeRetry(data: any[], retry: number = 10, attempt: number = 0): Promise<void> {
    if(attempt > retry)return;

    try{
      await this.#adapter.insert(data);
    }catch(e){
      console.log(e);
      await this.writeRetry(data, retry, attempt + 1);
    }
  }

  /**
   * @return Model
   */
  async write(): Promise<Model> {
    if (this.id) {
      await this.#adapter.update(this.#adapter.processValues());
    } else {
      const adapterClass = this.#adapter.constructor as typeof ORMAdapter;
      this.id = this.#options.insertID ?? adapterClass.defaultID() ?? ORMAdapter.defaultID();
      this.uuid = adapterClass.uuid() ?? ORMAdapter.uuid();
      this.created_at = Math.floor(Date.now() / 1000);
      await this.writeRetry(this.#adapter.processValues(), this.#options.retry ?? 10);
    }

    return this;
  }

  /**
   *
   * @returns {Promise<ORM>}
   */
  async read(columns: string[] = this.#defaultSelectColumns): Promise<void> {
    const result = await (
      this.id
        ? this.#adapter.read(columns)
        : this.#readByValues(columns)
    );

    if (!result) {
      throw new Error(`Record not found. ${this.constructor.name} id:${this.id}`);
    }

    Object.assign(this, result);
  }

  async #readByValues(columns: string[]): Promise<any> {
    const values = this.#getValues();
    if (values.size === 0) throw new Error(`${(this.constructor as typeof Model).name}: No id and no value to read`);
    const results = await this.#adapter.readAll(values, columns, 1);
    return results[0];
  }

  /**
   *
   * @returns {Promise<void>}
   */
  async delete(): Promise<void> {
    if (!this.id) throw new Error('ORM delete Error, no id defined');
    await this.#adapter.delete();
  }

  /**
   *
   * @param fk
   * @param options
   * @returns {Promise<*>}
   */
  async parent(fk: string, options?: ORMOption): Promise<Model | null> {
    // this fk is null or *, but not undefined
    if ((this as any)[fk] === null) return null;
    if ((this as any)[fk] === undefined) {
      throw new Error(`${fk} is not foreign key in ${(this.constructor as typeof Model).name}`);
    }

    const modelName = (this.constructor as typeof Model).belongsTo.get(fk);
    const ModelClass = await ORM.import(modelName!);
    return ORM.factory(ModelClass, (this as any)[fk], options);
  }

  /**
   * has many
   * @param MClass
   * @param fk
   * @return {[]}
   */
  async children(fk: string, MClass: typeof Model | null = null): Promise<Model[]> {
    const modelNames = (this.constructor as typeof Model).hasMany.filter(value => (value[0] === fk));
    if (modelNames.length > 1 && MClass === null) throw new Error('children fk have multiple Models, please specific which Model will be used');
    const ModelClass = MClass || await ORM.import(modelNames[0][1]);

    const results = await this.#adapter.hasMany(ModelClass.tableName!, fk);
    return results.map(x => Object.assign(new ModelClass(null, { database: this.#database }), x));
  }

  #siblingInfo(model: Model | Model[]): { joinTableName: string; lk: string; fk: string } {
    const m = Array.isArray(model) ? model[0] : model;
    const M = m.constructor as typeof Model;
    const lk = `${(this.constructor as typeof Model).joinTablePrefix}_id`;
    const fk = `${M.joinTablePrefix}_id`;

    if (!(this.constructor as typeof Model).belongsToMany.has(M.name)) {
      if (!M.belongsToMany.has((this.constructor as typeof Model).name)) {
        throw new Error(`${(this.constructor as typeof Model).name} and ${M.name} not have many to many relationship`);
      }

      return {
        joinTableName: `${M.joinTablePrefix}_${(this.constructor as typeof Model).tableName}`,
        lk,
        fk,
      };
    }

    return {
      joinTableName: `${(this.constructor as typeof Model).joinTablePrefix}_${M.tableName}`,
      lk,
      fk,
    };
  }

  /**
   * Get siblings
   * @param MClass
   * @return {[]}
   */
  async siblings(MClass: typeof Model): Promise<Model[]> {
    const instance = ORM.create(MClass, { database: this.#database });
    const { joinTableName, lk, fk } = this.#siblingInfo(instance);

    const results = await this.#adapter.belongsToMany(MClass.tableName!, joinTableName, lk, fk);
    return results.map(x => Object.assign(ORM.create(MClass, { database: this.#database }), x));
  }

  /**
   * add belongsToMany
   * @param model
   * @param weight
   * @returns void
   */
  async add(model: Model | Model[], weight: number = 0): Promise<void> {
    if (!this.id) throw new Error(`Cannot add ${(model as any).constructor.name}. ${(this.constructor as typeof Model).name} not have id`);
    // check model is not empty
    if (!model) throw new Error('Error add model, model cannot be null or undefined');
    if (Array.isArray(model) && model.length <= 0) throw new Error('Error add model, model array cannot be empty');

    const { joinTableName, lk, fk } = this.#siblingInfo(model);
    await this.#adapter.add(Array.isArray(model) ? model : [model], weight, joinTableName, lk, fk);
  }

  /**
   * remove
   * @param model
   */
  async remove(model: Model | Model[]): Promise<void> {
    if (!this.id) throw new Error(`Cannot remove ${(model as any).constructor.name}. ${(this.constructor as typeof Model).name} not have id`);

    const { joinTableName, lk, fk } = this.#siblingInfo(model);
    await this.#adapter.remove(Array.isArray(model) ? model : [model], joinTableName, lk, fk);
  }

  /**
   *
   * @param MClass
   * @returns {Promise<void>}
   */
  async removeAll(MClass: typeof Model): Promise<void> {
    if (!this.id) throw new Error(`Cannot remove ${MClass.name}. ${(this.constructor as typeof Model).name} not have id`);

    const { joinTableName, lk } = this.#siblingInfo(ORM.create(MClass));
    await this.#adapter.removeAll(joinTableName, lk);
  }
}

export type { ORMOption };

Object.freeze(Model.prototype);