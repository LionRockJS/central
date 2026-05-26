/**
 * Copyright (c) 2023 Kojin Nakana
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import Central from '../Central.mjs';

class DatabaseStatement {
  // eslint-disable-next-line no-useless-constructor,no-empty-function
  constructor(sql: string) {/***/}

  // eslint-disable-next-line class-methods-use-this
  async run(arg: any): Promise<any> {/***/}

  // eslint-disable-next-line class-methods-use-this
  async get(arg: any): Promise<any> { return {}; }

  // eslint-disable-next-line class-methods-use-this
  async all(arg: any): Promise<any[]> { return []; }
}

export default class DatabaseAdapter {
  /**
   *
   * @param datasource
   */
  // eslint-disable-next-line no-useless-constructor,no-empty-function
  constructor(datasource: any, options: any = {}) {/***/}

  // eslint-disable-next-line class-methods-use-this
  prepare(sql: string): DatabaseStatement { return new DatabaseStatement(sql); }

  // eslint-disable-next-line class-methods-use-this
  async transaction(fn: () => Promise<void>): Promise<void> {
    await this.transactionStart();
    try{
      await fn();
    }catch(e){
      await this.transactionRollback();
      throw e;
    }
    await this.transactionCommit();
  }

  // eslint-disable-next-line class-methods-use-this
  async exec(sql: string): Promise<void> {
    Central.log('Database exec using Abstract DatabaseAdapter', false);
    Central.log(sql, false);
  }

  // eslint-disable-next-line class-methods-use-this
  async close(): Promise<void> {/***/}

  // eslint-disable-next-line class-methods-use-this
  async transactionStart(): Promise<void> {/***/}

  // eslint-disable-next-line class-methods-use-this
  async transactionRollback(): Promise<void> {/***/}

  // eslint-disable-next-line class-methods-use-this
  async transactionCommit(): Promise<void> {/***/}

  // eslint-disable-next-line class-methods-use-this
  async checkpoint(): Promise<void> {/***/}

  /**
   *
   * @param datasource
   * @returns {function | Object | Database}
   */
  static create(datasource: any, options: any = {}): DatabaseAdapter {
    return new DatabaseAdapter(datasource, options);
  }
}
