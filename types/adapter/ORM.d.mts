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
    constructor(client: Model, database: any);
    static defaultID(): number;
    static uuid(): string;
    static translateValue(values: any[]): any[];
    processValues(): any[];
    read(columns?: string[]): Promise<any>;
    /**
     *
     * @param {[]} values
     * @returns {Promise<void>}
     */
    update(values: any): Promise<void>;
    /**
     *
     * @param {[]} values
     * @returns {Promise<void>}
     */
    insert(values: any): Promise<void>;
    /**
     * @returns {Promise<void>}
     */
    delete(): Promise<void>;
    /**
     *
     * @param tableName
     * @param key
     * @returns {Promise<void>}
     */
    hasMany(tableName: string, key: string): Promise<any[]>;
    /**
     *
     * @param modelTableName
     * @param jointTableName
     * @param lk
     * @param fk
     * @returns {Promise<void>}
     */
    belongsToMany(modelTableName: string, jointTableName: string, lk: string, fk: string): Promise<any[]>;
    /**
     * add belongsToMany
     * @param {Model[]} models
     * @param {number} weight
     * @param {string} jointTableName
     * @param {string} lk
     * @param {string} fk
     */
    add(models: any, weight: any, jointTableName: any, lk: any, fk: any): Promise<void>;
    /**
     * remove
     * @param {ORM[]} models
     * @param {string} jointTableName
     * @param {string} lk
     * @param {string} fk
     */
    remove(models: any, jointTableName: any, lk: any, fk: any): Promise<void>;
    /**
     *
     * @param {string} jointTableName
     * @param {string} lk
     * @returns {Promise<void>}
     */
    removeAll(jointTableName: any, lk: any): Promise<void>;
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
    readAll(kv: any, columns?: string[], limit?: number, offset?: number, orderBy?: Map<string, string>): Promise<any[]>;
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
    readBy(key: any, values: any, columns?: string[], limit?: number, offset?: number, orderBy?: Map<string, string>): Promise<any[]>;
    /**
     *
     * @param {[[string]]}criteria
     * @param {number} limit
     * @param {string[]} columns
     * @param {number} offset
     * @param {Map} orderBy
     * @returns {Promise<[]>}
     */
    readWith(criteria: any, columns?: string[], limit?: number, offset?: number, orderBy?: Map<string, string>): Promise<any[]>;
    /**
     * @param {Map|null} kv
     * @returns {Promise<number>}
     */
    countAll(kv?: any): Promise<number>;
    /**
     *
     * @param {string} key
     * @param {[]} values
     * @returns {Promise<number>}
     */
    countBy(key: any, values: any): Promise<number>;
    /**
     *
     * @param {[[string]]}criteria
     * @returns {Promise<number>}
     */
    countWith(criteria: any): Promise<number>;
    /**
     *
     * @param {Map|null} kv
     * @returns {Promise<void>}
     */
    deleteAll(kv?: any): Promise<void>;
    /**
     *
     * @param {string} key
     * @param {[]} values
     * @returns {Promise<void>}
     */
    deleteBy(key: any, values: any): Promise<void>;
    /**
     *
     * @param {[[string]]}criteria
     * @returns {Promise<void>}
     */
    deleteWith(criteria: any): Promise<void>;
    /**
     *
     * @param {Map} kv
     * @param {Map} columnValues
     * @returns {Promise<void>}
     */
    updateAll(kv: any, columnValues: any): Promise<void>;
    /**
     *
     * @param {string} key
     * @param {[]} values
     * @param {Map} columnValues
     * @returns {Promise<void>}
     */
    updateBy(key: any, values: any, columnValues: any): Promise<void>;
    /**
     *
     * @param {[[string]]}criteria
     * @param {Map} columnValues
     * @returns {Promise<void>}
     */
    updateWith(criteria: any, columnValues: any): Promise<void>;
    /**
     *
     * @param {[]} columns
     * @param {[[]]} valueGroups
     * @param {number[]} ids
     * @returns {Promise<void>}
     */
    insertAll(columns: any, valueGroups: any, ids: any): Promise<void>;
}
