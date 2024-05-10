/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import Central from './Central.mjs';
import Model from './Model.mjs';

export default class ORM {
  static classPrefix = 'model/';

  /**
   * @param {typeof Model} MClass
   * @param options
   * @param options.database
   * @param options.adapter
   * @param options.insertID
   * @returns {Model}
   */
  static create(MClass, options = {}) {
    return new MClass(null, options);
  }

  /**
   * Create and read data from database
   * @param {typeof Model} MClass
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
    const result = await m.getCollection().readAll();

    return this.#readResult(result, m, x => Object.assign(ORM.create(MClass, options), x), options.asArray);
  }

  /**
   *
   * @param {typeof Model} MClass
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
    const result = await m.getCollection().readBy(key, values) || [];

    return this.#readResult(result, m, x => Object.assign(ORM.create(MClass, options), x), options.asArray);
  }

  /**
   * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
   * @param {typeof Model} MClass
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
    const result = await m.getCollection().readWith(criteria) || [];
    return this.#readResult(result, m, x => Object.assign(ORM.create(MClass, options), x), options.asArray);
  }

  /**
   *
   * @param {typeof Model} MClass
   * @param options
   * @param options.database
   * @param options.adapter
   * @param options.kv
   * @returns {Promise<*>}
   */
  static async countAll(MClass, options = {}) {
    return await this.#collection(MClass, options).countAll();
  }

  /**
   *
   * @param {typeof Model} MClass
   * @param {string} key
   * @param {[]} values
   * @param options
   * @returns {Promise<void>}
   */
  static async countBy(MClass, key, values, options = {}) {
    return await this.#collection(MClass, options).countBy(key, values);
  }

  /**
   * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
   * @param {typeof Model} MClass
   * @param {[[string]]}criteria
   * @param options
   * @returns {Promise<void>}
   */
  static async countWith(MClass, criteria, options = {}) {
    if (!criteria || criteria.length === 0) throw new Error(`${MClass.constructor.name} count with no criteria`);

    return await this.#collection(MClass, options).countWith(criteria);
  }

  static async deleteAll(MClass, options = {}) {
    await this.#collection(MClass, options).deleteAll(options.kv);
  }

  /**
   *
   * @param {typeof Model} MClass
   * @param {string} key
   * @param {[]} values
   * @param options
   * @returns {Promise<void>}
   */
  static async deleteBy(MClass, key, values, options = {}) {
    await this.#collection(MClass, options).deleteBy(key, values);
  }

  /**
   * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
   * @param {typeof Model} MClass
   * @param {[[string]]}criteria
   * @param options
   * @returns {Promise<void>}
   */
  static async deleteWith(MClass, criteria, options = {}) {
    if (!criteria || criteria.length === 0) throw new Error(`${MClass.name} delete with no criteria`);

    const m = ORM.create(MClass, options);
    return m.getCollection().deleteWith(criteria);
  }

  /**
   * @param {typeof Model} MClass
   * @param options
   * @param {Map} kv
   * @param {Map} columnValues
   */
  static async updateAll(MClass, kv, columnValues, options = {}) {
    const m = ORM.create(MClass, options);
    await m.getCollection().updateAll(kv, columnValues);
  }

  /**
   *
   * @param {typeof Model} MClass
   * @param options
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
   * @param options
   * @param {[[string]]}criteria
   * @param {Map} columnValues
   * @returns {Promise<*>}
   */
  static async updateWith(MClass, criteria, columnValues, options = {}) {
    if (!criteria || criteria.length === 0) throw new Error(`${MClass.constructor.name} update with no criteria`);
    if (!columnValues || columnValues.size === 0) throw new Error(`${MClass.constructor.name} update without values`);

    await this.#collection(MClass, options).updateWith(criteria, columnValues);
  }

  /**
   *
   * @param {typeof Model} MClass
   * @param options
   * @param {string[]} columns
   * @param {[String[]]} values
   * @returns {Promise<void>}
   */
  static async insertAll(MClass, columns, values, options = {}) {
    // verify columns
    columns.forEach(x => {
      if (x === 'id') return;
      if (!MClass.fields.has(x) && !MClass.belongsTo.has(x)) throw new Error(`${MClass.constructor.name} insert invalid columns ${x}`);
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

        class JoinTable extends Model{
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