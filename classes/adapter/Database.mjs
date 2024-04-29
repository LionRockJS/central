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
  constructor(sql) {/***/}

  // eslint-disable-next-line class-methods-use-this
  async run(arg) {/***/}

  // eslint-disable-next-line class-methods-use-this
  async get(arg) { return {}; }

  // eslint-disable-next-line class-methods-use-this
  async all(arg) { return []; }
}

export default class Database {
  /**
   *
   * @param {string} datasource
   */
  // eslint-disable-next-line no-useless-constructor,no-empty-function
  constructor(datasource) {/***/}

  // eslint-disable-next-line class-methods-use-this
  prepare(sql) { return new DatabaseStatement(sql); }

  // eslint-disable-next-line class-methods-use-this
  async transaction(fn) {
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
  async exec(sql) {
    Central.log('Database exec using Abstract DatabaseAdapter');
    Central.log(sql);
  }

  // eslint-disable-next-line class-methods-use-this
  async close() {/***/}

  // eslint-disable-next-line class-methods-use-this
  async transactionStart(){/***/}

  // eslint-disable-next-line class-methods-use-this
  async transactionRollback(){/***/}

  // eslint-disable-next-line class-methods-use-this
  async transactionCommit(){/***/}

  // eslint-disable-next-line class-methods-use-this
  async checkpoint(){/***/}

  /**
   *
   * @param {string} datasource
   * @returns {function | Object | Database}
   */
  static create(datasource) {
    return new Database(datasource);
  }
}
