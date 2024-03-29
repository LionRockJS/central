/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import Central from './Central.mjs';
import ORMAdapter from './adapter/ORM.mjs';

export default class ORM {
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

  static defaultAdapter = ORMAdapter;

  static classPrefix = 'model/';

  uuid = null;

  created_at = null;

  updated_at = null;

  #database = null;
  #options = null;
  #states = null;
  #adapter = null;
  #columns = null;

  constructor(id = null, options = {}) {
    this.#database = options.database || ORM.database;
    this.#options = options;
    this.#states = [];

    const Adapter = options.adapter || this.constructor.defaultAdapter;
    this.#adapter = new Adapter(this, this.#database);

    // list all columns of the model.
    this.#columns = Array.from(this.constructor.fields.keys());
    // add belongsTo to columns
    Array.from(this.constructor.belongsTo.keys()).forEach(x => this.#columns.push(x));

    this.id = id;
  }

  /**
   *
   * @returns {Array}
   */
  getColumns(){
    return this.#columns;
  }

  /**
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
   * @param {object} option.*
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
        const instance = await this.parent(p.key);
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
      await this.writeRetry(data, retry, attempt + 1);
    }
  }

  /**
   * @return ORM
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
  async read() {
    const result = await (
      this.id
        ? this.#readByID()
        : this.#readByValues()
    );

    if (!result) {
      throw new Error(`Record not found. ${this.constructor.name} id:${this.id}`);
    }

    Object.assign(this, result);
    return this;
  }

  async #readByID() {
    return this.#adapter.read();
  }

  async #readByValues() {
    const values = this.#getValues();
    if (values.size === 0) throw new Error(`${this.constructor.name}: No id and no value to read`);
    const results = await this.#adapter.readAll(values, 1);
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

  // relation methods
  /**
   * belongs to - this table have xxx_id column
   * @param {string} fk
   * @param {*} database
   * @param {string} modelClassPath
   * @returns {ORM}
   */

  /**
   *
   * @param fk
   * @returns {Promise<*>}
   */
  async parent(fk) {
    // this fk is null or *, but not undefined
    if (this[fk] === null) return null;
    if (this[fk] === undefined) {
      throw new Error(`${fk} is not foreign key in ${this.constructor.name}`);
    }

    const modelName = this.constructor.belongsTo.get(fk);
    const ModelClass = await ORM.import(modelName);
    return ORM.factory(ModelClass, this[fk], { database: this.#database });
  }

  /**
   * has many
   * @param {ORM} MClass
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
   * @param {ORM.} MClass
   * @return {[]}
   */
  async siblings(MClass) {
    const { joinTableName, lk, fk } = this.#siblingInfo(ORM.create(MClass));

    const results = await this.#adapter.belongsToMany(MClass.tableName, joinTableName, lk, fk);
    return results.map(x => Object.assign(ORM.create(MClass, { database: this.#database }), x));
  }

  /**
   * add belongsToMany
   * @param {ORM | ORM[]} model
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
   * @param {ORM| ORM[]} model
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

  /**
   * @param MClass
   * @param options
   * @param options.database
   * @param options.adapter
   * @param options.insertID
   * @returns {ORM}
   */
  static create(MClass, options = {}) {
    return new MClass(null, options);
  }

  /**
   * Create and read data from database
   * @param MClass
   * @param id
   * @param options
   * @param options.database
   * @param options.adapter
   * @returns {Promise<*>}
   */
  static async factory(MClass, id, options = {}) {
    const m = new MClass(id, options);
    await m.read();
    return m;
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
   * @param {ORM.} MClass
   * @param {object} options
   * @param options.database
   * @param options.adapter
   * @param options.kv
   * @param options.limit
   * @param options.offset
   * @param options.orderBy
   * @param options.asArray
   * @returns {Promise<[]|object>}
   */
  static async readAll(MClass, options = {}) {
    const m = ORM.create(MClass, options);
    const result = await m.#adapter.readAll(options.kv, options.limit, options.offset, options.orderBy) || [];

    return this.#readResult(result, m, x => Object.assign(ORM.create(MClass, options), x), options.asArray);
  }

  /**
   *
   * @param MClass
   * @param key
   * @param values
   * @param options
   * @param options.database
   * @param options.adapter
   * @param options.limit
   * @param options.offset
   * @param options.orderBy
   * @param options.asArray
   * @returns {Promise<[]|object>}
   */
  static async readBy(MClass, key, values, options = {}) {
    const m = ORM.create(MClass, options);
    const result = await m.#adapter.readBy(key, values, options.limit, options.offset, options.orderBy);

    return this.#readResult(result, m, x => Object.assign(ORM.create(MClass, options), x), options.asArray);
  }

  /**
   * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
   * @param MClass
   * @param criteria
   * @param options
   * @param options.database
   * @param options.adapter
   * @param options.limit
   * @param options.offset
   * @param options.orderBy
   * @param options.asArray
   * @returns {Promise<[]|object>}
   */
  static async readWith(MClass, criteria = [], options = {}) {
    if (criteria.length === 0) return [];
    const m = ORM.create(MClass, options);
    const result = await m.#adapter.readWith(criteria, options.limit, options.offset, options.orderBy);

    return this.#readResult(result, m, x => Object.assign(ORM.create(MClass, options), x), options.asArray);
  }

  /**
   *
   * @param MClass
   * @param options
   * @param options.database
   * @param options.adapter
   * @param options.kv
   * @returns {Promise<*>}
   */
  static async count(MClass, options = {}) {
    const m = ORM.create(MClass, options);
    return m.#adapter.count(options.kv);
  }

  /**
   *
   * @param {ORM.} MClass
   * @param {string} key
   * @param {[]} values
   * @param options
   * @returns {Promise<void>}
   */
  static async countBy(MClass, key, values, options = {}) {
    const m = ORM.create(MClass, options);
    return m.#adapter.countBy(key, values);
  }

  /**
   * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
   * @param {ORM.} MClass
   * @param {[[string]]}criteria
   * @param options
   * @returns {Promise<void>}
   */
  static async countWith(MClass, criteria, options = {}) {
    if (!criteria || criteria.length === 0) throw new Error(`${MClass.name} count with no criteria`);

    const m = ORM.create(MClass, options);
    return m.#adapter.countWith(criteria);
  }

  static async deleteAll(MClass, options = {}) {
    const m = ORM.create(MClass, options);
    await m.#adapter.deleteAll(options.kv);
  }

  /**
   *
   * @param {ORM.} MClass
   * @param {string} key
   * @param {[]} values
   * @param options
   * @returns {Promise<void>}
   */
  static async deleteBy(MClass, key, values, options = {}) {
    const m = ORM.create(MClass, options);
    return m.#adapter.deleteBy(key, values);
  }

  /**
   * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
   * @param {ORM.} MClass
   * @param {[[string]]}criteria
   * @param options
   * @returns {Promise<void>}
   */
  static async deleteWith(MClass, criteria, options = {}) {
    if (!criteria || criteria.length === 0) throw new Error(`${MClass.name} delete with no criteria`);

    const m = ORM.create(MClass, options);
    return m.#adapter.deleteWith(criteria);
  }

  /**
   * @param {ORM.} MClass
   * @param options
   * @param {Map} kv
   * @param {Map} columnValues
   */
  static async updateAll(MClass, kv, columnValues, options = {}) {
    const m = ORM.create(MClass, options);
    await m.#adapter.updateAll(kv, columnValues);
  }

  /**
   *
   * @param {ORM.} MClass
   * @param options
   * @param {string} key
   * @param {[]} values
   * @param {Map} columnValues
   * @returns {Promise<void>}
   */
  static async updateBy(MClass, key, values, columnValues, options = {}) {
    const m = ORM.create(MClass, options);
    return m.#adapter.updateBy(key, values, columnValues);
  }

  /**
   * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
   * @param {ORM.} MClass
   * @param options
   * @param {[[string]]}criteria
   * @param {Map} columnValues
   * @returns {Promise<*>}
   */
  static async updateWith(MClass, criteria, columnValues, options = {}) {
    if (!criteria || criteria.length === 0) throw new Error(`${MClass.name} update with no criteria`);
    if (!columnValues || columnValues.size === 0) throw new Error(`${MClass.name} update without values`);

    const m = ORM.create(MClass, options);
    return m.#adapter.updateWith(criteria, columnValues);
  }

  /**
   *
   * @param {ORM.} MClass
   * @param options
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

    const m = ORM.create(MClass, options);
    return m.#adapter.insertAll(columns, values, options.insertIDs || []);
  }

  static async import(modelName) {
    return Central.import(ORM.classPrefix + modelName);
  }

  /**
   *
   * @param {ORM[]} orms
   * @param {Object} eagerLoadOptions
   * @param {Object} ormOptions
   * @returns {Promise<ORM[]>}
   */
  static async eagerLoad(orms, eagerLoadOptions, ormOptions){
    if(orms.length < 1)return [];
    if(!eagerLoadOptions.with)return [];
    //with is belongsTo, hasMany
    const belongsToMap = new Map();
    const hasManyMap = new Map();
    const belongsToManyMap = new Map();
    const orm_ids = orms.map(it => it.id);
    const M = orms[0].constructor;

    const allowClasses = new Set(eagerLoadOptions.with);

    await Promise.all(
    [...M.belongsTo.entries()].map( async it => {
      const parentModel = it[1];
      const field = it[0];

      if(!allowClasses.has(parentModel))return;
      const ParentModel = await ORM.import(parentModel);

      belongsToMap.set(parentModel, {
        field,
        property: ParentModel.joinTablePrefix,
        values: orms.map(it=> it[field]),
        instances: []
      });

      allowClasses.delete(parentModel);
    }));

    await Promise.all(
    [...M.hasMany.entries()].map( async entry => {
      const fk = entry[0];
      const childModel = entry[1];
      if(!allowClasses.has(childModel))return;

      const ChildModel = await ORM.import(childModel);

      hasManyMap.set(childModel, {
        fk,
        property: ChildModel.tableName,
        values: orm_ids,
        instances: []
      });

      allowClasses.delete(childModel);
    }));

    await Promise.all(
    [...M.belongsToMany.keys()].map(async siblingModel => {
      if(!allowClasses.has(siblingModel))return;
      const SiblingModel = await ORM.import(siblingModel)
      belongsToManyMap.set(siblingModel, {
        property: SiblingModel.tableName,
        values: orm_ids,
        instances: []
      })

      allowClasses.delete(siblingModel);
    }));

    //request with RelatedModel but not in belongsTo, hasMany and belongsToMany
    await Promise.all(
    [...allowClasses.values()].map(
      async relatedModelName => {
        const RelatedModel = await ORM.import(relatedModelName);

        //check is further parent
        if(M.fields.has(RelatedModel.joinTablePrefix+'_id')){
          const field = RelatedModel.joinTablePrefix+'_id'

          belongsToMap.set(relatedModelName, {
            field,
            property: RelatedModel.joinTablePrefix,
            values: orms.map(it=> it[field]),
            instances: []
          });

          allowClasses.delete(relatedModelName);
          return;
        }

        //check is further children
        if(RelatedModel.fields.has(M.joinTablePrefix+'_id')){
          const fk = M.joinTablePrefix+'_id';

          hasManyMap.set(RelatedModel, {
            fk,
            property: RelatedModel.tableName,
            values: orm_ids,
            instances: []
          });
          allowClasses.delete(relatedModelName);
        }
      }
    ));

    if(allowClasses.size > 0)throw new Error('Invalid eager load with ' + Array.from(allowClasses.values()));

    await Promise.all(
      [
      ...Array.from(belongsToMap.entries()).map(async v => {
        const M = await ORM.import(v[0]);
        v[1].instances = await ORM.readBy(M, 'id', v[1].values, {...ormOptions, asArray:true});
      }),
      ...Array.from(hasManyMap.entries()).map(async v => {
        const M = await ORM.import(v[0]);
        v[1].instances = await ORM.readBy(M, v[1].fk, v[1].values, {...ormOptions, asArray:true});
      }),
      ...Array.from(belongsToManyMap.entries()).map(async v => {
        const siblingModel = await ORM.import(v[0]);

        class JoinTable extends ORM{
          static tableName = M.joinTablePrefix + "_" + v.property;
        }

        const joins = await ORM.readBy(JoinTable, `${M.joinTablePrefix}_id`, v[1].values, {...ormOptions, asArray:true});
        const siblingMap = new Map();
        joins.forEach(join => {
          siblingMap.set( join[`${siblingModel.joinTablePrefix}_id`] , join[`${M.joinTablePrefix}_id`])
        })

        const instances = await ORM.readBy(siblingModel, 'id', joins.map(it => it[`${siblingModel.joinTablePrefix}_id`]), {...ormOptions, asArray:true});
        instances.forEach(instance => instance.sibling = siblingMap.get(instance.id))
        v[1].instances = instances
      }),
      ]
    )

    const promises = [];
    orms.forEach(it =>{
      belongsToMap.forEach(v =>{
        const field = v.field;
        const property = v.property;
        const instances = v.instances;
        //it.parent = parents(it.parent_id)
        it[property] = instances.find( parent => parent.id === it[field] );
        if(eagerLoadOptions[property]) promises.push(this.eagerLoad(instances, eagerLoadOptions[property], ormOptions));
      })

      hasManyMap.forEach(v =>{
        const fk = v.fk;
        const property = v.property;
        const instances = v.instances;

        it[property] = instances.filter( children => children[fk] === it.id );
        if(eagerLoadOptions[property]) promises.push(this.eagerLoad(instances, eagerLoadOptions[property], ormOptions));
      })

      belongsToManyMap.forEach(v => {
        const property = v.property;
        const instances = v.instances;

        it[property] = instances.filter( sibling => sibling.sibling === it.id);
        if(eagerLoadOptions[property]) promises.push(this.eagerLoad(instances, eagerLoadOptions[property], ormOptions));
      })
    })

    //recursive
    await Promise.all(promises);
    return orms;
  }
}

Object.freeze(ORM.prototype);