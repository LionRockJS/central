/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import ORMAdapter from './adapter/ORM.mjs';
import ModelCollection from './ModelCollection.mjs';
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
export default class Model {
    #private;
    static database: any;
    static tableName: string | null;
    static joinTablePrefix: string | null;
    static fields: Map<string, any>;
    static belongsTo: Map<string, string>;
    static hasMany: [string, string][];
    static belongsToMany: Set<string>;
    static classPrefix: string;
    static defaultAdapter: typeof ORMAdapter;
    uuid: string | null;
    created_at: number | null;
    updated_at: number | null;
    id: string | number | null;
    /**
     * @param id
     * @param options
     * */
    constructor(id?: string | number | null, options?: ORMOption);
    /**
     *
     * @returns {ModelCollection}
     */
    getCollection(): ModelCollection;
    /**
     * columns is a list of fields and belongsTo keys.
     *
     * @returns {Array}
     */
    getColumns(): string[];
    /**
     * states is a list of snapshots of the model.
     *
     * @returns {Array}
     */
    getStates(): any[];
    snapshot(): void;
    /**
     *
     * @param option
     * @returns {Promise<void>}
     */
    eagerLoad(option?: any): Promise<void>;
    writeRetry(data: any[], retry?: number, attempt?: number): Promise<void>;
    /**
     * @return Model
     */
    write(): Promise<Model>;
    /**
     *
     * @returns {Promise<ORM>}
     */
    read(columns?: string[]): Promise<void>;
    /**
     *
     * @returns {Promise<void>}
     */
    delete(): Promise<void>;
    /**
     *
     * @param fk
     * @param options
     * @returns {Promise<*>}
     */
    parent(fk: string, options?: ORMOption): Promise<Model | null>;
    /**
     * has many
     * @param MClass
     * @param fk
     * @return {[]}
     */
    children(fk: string, MClass?: typeof Model | null): Promise<Model[]>;
    /**
     * Get siblings
     * @param MClass
     * @return {[]}
     */
    siblings(MClass: typeof Model): Promise<Model[]>;
    /**
     * add belongsToMany
     * @param model
     * @param weight
     * @returns void
     */
    add(model: Model | Model[], weight?: number): Promise<void>;
    /**
     * remove
     * @param model
     */
    remove(model: Model | Model[]): Promise<void>;
    /**
     *
     * @param MClass
     * @returns {Promise<void>}
     */
    removeAll(MClass: typeof Model): Promise<void>;
}
export type { ORMOption };
