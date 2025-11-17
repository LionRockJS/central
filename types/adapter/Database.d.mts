/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
declare class DatabaseStatement {
    constructor(sql: string);
    run(arg: any): Promise<any>;
    get(arg: any): Promise<any>;
    all(arg: any): Promise<any[]>;
}
export default class DatabaseAdapter {
    /**
     *
     * @param datasource
     */
    constructor(datasource: string);
    prepare(sql: string): DatabaseStatement;
    transaction(fn: () => Promise<void>): Promise<void>;
    exec(sql: string): Promise<void>;
    close(): Promise<void>;
    transactionStart(): Promise<void>;
    transactionRollback(): Promise<void>;
    transactionCommit(): Promise<void>;
    checkpoint(): Promise<void>;
    /**
     *
     * @param datasource
     * @returns {function | Object | Database}
     */
    static create(datasource: string): DatabaseAdapter;
}
export {};
