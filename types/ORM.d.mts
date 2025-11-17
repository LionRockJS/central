import Model, { type ORMOption } from './Model.mjs';
export default class ORM {
    #private;
    static classPrefix: string;
    static create(MClass: typeof Model, options?: ORMOption): Model;
    static factory(MClass: typeof Model, id: string | number, options?: ORMOption): Promise<Model>;
    static readAll(MClass: typeof Model, options?: ORMOption): Promise<Model | Model[] | null>;
    static readBy(MClass: typeof Model, key: string, values: (string | number)[], options?: ORMOption): Promise<Model | Model[]>;
    /**
     * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
     */
    static readWith(MClass: typeof Model, criteria?: string[][], options?: ORMOption): Promise<Model | Model[]>;
    static countAll(MClass: typeof Model, options?: ORMOption): Promise<number>;
    static countBy(MClass: typeof Model, key: string, values: (string | number)[], options?: ORMOption): Promise<number>;
    /**
     * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
     */
    static countWith(MClass: typeof Model, criteria: string[][], options?: ORMOption): Promise<number>;
    static deleteAll(MClass: typeof Model, options?: ORMOption): Promise<void>;
    static deleteBy(MClass: typeof Model, key: string, values: (string | number)[], options?: ORMOption): Promise<void>;
    /**
     * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
     */
    static deleteWith(MClass: typeof Model, criteria: string[][], options?: ORMOption): Promise<void>;
    static updateAll(MClass: typeof Model, kv: any, columnValues: any, options?: ORMOption): Promise<void>;
    static updateBy(MClass: typeof Model, key: string, values: (string | number)[], columnValues: any, options?: ORMOption): Promise<void>;
    /**
     * Given criterias [['', 'id', SQL.EQUAL, 11], [SQL.AND, 'name', SQL.EQUAL, 'peter']]
     */
    static updateWith(MClass: typeof Model, criteria: string[][], columnValues: any, options?: ORMOption): Promise<void>;
    static insertAll(MClass: typeof Model, columns: string[], values: any[], options?: ORMOption): Promise<void>;
    static import(modelName: string, defaultMClass?: typeof Model): Promise<typeof Model>;
    static eagerLoad(orms: Model[], eagerLoadOptions: any): Promise<void>;
    static write(model: Model): Promise<Model>;
}
