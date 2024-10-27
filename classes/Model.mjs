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

export default class Model {
  // ORM is abstract, joinTablePrefix and tableName is null.
  static database = null;

  static tableName = null;

  // associative (junction) table name prefix
  static joinTablePrefix = null;

  static fields = new Map();

  static belongsTo = new Map();

  // hasMany cannot be Map, because children models may share same fk name.
  static hasMany = [];

  static belongsToMany = new Set();

  static classPrefix = 'model/';

  static defaultAdapter = ORMAdapter;

  uuid = null;

  created_at = null;

  updated_at = null;

  #database = null;
  /** @type ORMOption */
  #options = {};
  #states = null;
  #adapter = null;
  #columns = null;

  #collection = null;

  /**
   * @param {string | null} id
   * @param {...ORMOption} options
   * */
  constructor(id = null, options = {}) {
    this.#database = options.database || Model.database;
    this.#options = options;
    this.#states = [];

    const Adapter = options.adapter || Model.defaultAdapter;
    this.#adapter = new Adapter(this, this.#database);

    // list all columns of the model.
    this.#columns = Array.from(this.constructor.fields.keys());
    // add belongsTo to columns
    Array.from(this.constructor.belongsTo.keys()).forEach(x => this.#columns.push(x));

    this.id = id;
    this.#collection = new ModelCollection(this.#adapter, this.#options);
  }

  /**
   *
   * @returns {ModelCollection}
   */
  getCollection(){
    return this.#collection;
  }

  /**
   * columns is a list of fields and belongsTo keys.
   *
   * @returns {Array}
   */
  getColumns(){
    return this.#columns;
  }

  /**
   * states is a list of snapshots of the model.
   *
   * @returns {Array}
   */
  getStates(){
    return this.#states;
  }

  snapshot() {
    this.#states.push({ ...this });
  }

  /**
   *
   * @param {object} option
   * @param {String[]|*} option.with
   * @param {...ORMOption} option
   * @returns {Promise<void>}
   */
  async eagerLoad(option = {}) {
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

    const parents = [];
    this.constructor.belongsTo.forEach((v, k) => {
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

    const props = [];

    await Promise.all(
    this.constructor.hasMany.map(async x => {
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

    const siblings = [];
    await Promise.all(
      [...this.constructor.belongsToMany.keys()].map(async x => {
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
  #getValues() {
    const values = new Map();
    this.constructor.fields.forEach((v, k) => {
      if (this[k])values.set(k, this[k]);
    });
    return values;
  }

  // instance methods

  async writeRetry(data, retry=10, attempt=0){
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
  async write() {
    if (this.id) {
      await this.#adapter.update(this.#adapter.processValues());
    } else {
      const adapterClass = this.#adapter.constructor;
      this.id = this.#options.insertID ?? adapterClass.defaultID() ?? ORMAdapter.defaultID();
      this.uuid = adapterClass.uuid() ?? ORMAdapter.uuid();
      await this.writeRetry(this.#adapter.processValues(), this.#options.retry);
    }

    return this;
  }

  /**
   *
   * @returns {Promise<ORM>}
   */
  async read(columns = ['id', 'name']) {
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

  async #readByValues(columns) {
    const values = this.#getValues();
    if (values.size === 0) throw new Error(`${this.constructor.name}: No id and no value to read`);
    const results = await this.#adapter.readAll(values, columns, 1);
    return results[0];
  }

  /**
   *
   * @returns {Promise<void>}
   */
  async delete() {
    if (!this.id) throw new Error('ORM delete Error, no id defined');
    await this.#adapter.delete();
  }

  /**
   *
   * @param fk
   * @param {...ORMOption} options
   * @returns {Promise<*>}
   */
  async parent(fk, options) {
    // this fk is null or *, but not undefined
    if (this[fk] === null) return null;
    if (this[fk] === undefined) {
      throw new Error(`${fk} is not foreign key in ${this.constructor.name}`);
    }

    const modelName = this.constructor.belongsTo.get(fk);
    const ModelClass = await ORM.import(modelName);
    return ORM.factory(ModelClass, this[fk], options);
  }

  /**
   * has many
   * @param {Model.constructor} MClass
   * @param {string} fk
   * @return {[]}
   */
  async children(fk, MClass = null) {
    const modelNames = this.constructor.hasMany.filter(value => (value[0] === fk));
    if (modelNames.length > 1 && MClass === null) throw new Error('children fk have multiple Models, please specific which Model will be used');
    const ModelClass = MClass || await ORM.import(modelNames[0][1]);

    const results = await this.#adapter.hasMany(ModelClass.tableName, fk);
    return results.map(x => Object.assign(new ModelClass(null, { database: this.#database }), x));
  }

  #siblingInfo(model) {
    const m = Array.isArray(model) ? model[0] : model;
    const M = m.constructor;
    const lk = `${this.constructor.joinTablePrefix}_id`;
    const fk = `${M.joinTablePrefix}_id`;

    if (!this.constructor.belongsToMany.has(M.name)) {
      if (!M.belongsToMany.has(this.constructor.name)) {
        throw new Error(`${this.constructor.name} and ${M.name} not have many to many relationship`);
      }

      return {
        joinTableName: `${M.joinTablePrefix}_${this.constructor.tableName}`,
        lk,
        fk,
      };
    }

    return {
      joinTableName: `${this.constructor.joinTablePrefix}_${M.tableName}`,
      lk,
      fk,
    };
  }

  /**
   * Get siblings
   * @param {Model.} MClass
   * @return {[]}
   */
  async siblings(MClass) {
    const { joinTableName, lk, fk } = this.#siblingInfo(ORM.create(MClass));

    const results = await this.#adapter.belongsToMany(MClass.tableName, joinTableName, lk, fk);
    return results.map(x => Object.assign(ORM.create(MClass, { database: this.#database }), x));
  }

  /**
   * add belongsToMany
   * @param {Model | Model[]} model
   * @param {number} weight
   * @returns void
   */
  async add(model, weight = 0) {
    if (!this.id) throw new Error(`Cannot add ${model.constructor.name}. ${this.constructor.name} not have id`);
    // check model is not empty
    if (!model) throw new Error('Error add model, model cannot be null or undefined');
    if (Array.isArray(model) && model.length <= 0) throw new Error('Error add model, model array cannot be empty');

    const { joinTableName, lk, fk } = this.#siblingInfo(model);
    await this.#adapter.add(Array.isArray(model) ? model : [model], weight, joinTableName, lk, fk);
  }

  /**
   * remove
   * @param {Model| Model[]} model
   */
  async remove(model) {
    if (!this.id) throw new Error(`Cannot remove ${model.constructor.name}. ${this.constructor.name} not have id`);

    const { joinTableName, lk, fk } = this.#siblingInfo(model);
    await this.#adapter.remove(Array.isArray(model) ? model : [model], joinTableName, lk, fk);
  }

  /**
   *
   * @param MClass
   * @returns {Promise<void>}
   */
  async removeAll(MClass) {
    if (!this.id) throw new Error(`Cannot remove ${MClass.name}. ${this.constructor.name} not have id`);

    const { joinTableName, lk } = this.#siblingInfo(ORM.create(MClass));
    await this.#adapter.removeAll(joinTableName, lk);
  }
}

Object.freeze(Model.prototype);