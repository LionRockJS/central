export default class ModelCollection {
    #private;
    constructor(adapter: any, options: any, columns: string[]);
    readAll(columns?: string[]): Promise<any[]>;
    readBy(key: string, values: any[], columns?: string[]): Promise<any[]>;
    readWith(criteria: any[][], columns?: string[]): Promise<any[]>;
    countAll(): Promise<number>;
    countBy(key: string, values: any[]): Promise<number>;
    countWith(criteria?: any[][]): Promise<number>;
    deleteAll(): Promise<void>;
    deleteBy(key: string, values: any[]): Promise<void>;
    deleteWith(criteria?: any[][]): Promise<void>;
    updateAll(kv: any, columnValues: any): Promise<void>;
    updateBy(key: string, values: any[], columnValues: any): Promise<void>;
    updateWith(criteria: any[][], columnValues: any): Promise<void>;
    insertAll(columns: string[], values: any[]): Promise<void>;
}
