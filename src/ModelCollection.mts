export default class ModelCollection{
  #adapter: any;
  #options: any;
  #columns: string[];

  constructor(adapter: any, options: any, columns: string[]){
    this.#adapter = adapter;
    this.#options = options;
    this.#columns = columns;
  }

  async readAll(columns: string[] = this.#columns): Promise<any[]> {
    return await this.#adapter.readAll(this.#options.kv, columns, this.#options.limit, this.#options.offset, this.#options.orderBy);
  }

  async readBy(key: string, values: any[], columns: string[] = this.#columns): Promise<any[]> {
    return await this.#adapter.readBy(key, values, columns, this.#options.limit, this.#options.offset, this.#options.orderBy);
  }

  async readWith(criteria: any[][], columns: string[] = this.#columns): Promise<any[]> {
    return await this.#adapter.readWith(criteria, columns, this.#options.limit, this.#options.offset, this.#options.orderBy);
  }

  async countAll(): Promise<number> {
    return await this.#adapter.countAll(this.#options.kv);
  }

  async countBy(key: string, values: any[]): Promise<number> {
    return await this.#adapter.countBy(key, values);
  }

  async countWith(criteria: any[][] = []): Promise<number> {
    return await this.#adapter.countWith(criteria);
  }

  async deleteAll(): Promise<void> {
    await this.#adapter.deleteAll(this.#options.kv);
  }

  async deleteBy(key: string, values: any[]): Promise<void> {
    await this.#adapter.deleteBy(key, values);
  }

  async deleteWith(criteria: any[][] = []): Promise<void> {
    await this.#adapter.deleteWith(criteria);
  }

  async updateAll(kv: any, columnValues: any): Promise<void> {
    await this.#adapter.updateAll(kv, columnValues);
  }

  async updateBy(key: string, values: any[], columnValues: any): Promise<void> {
    await this.#adapter.updateBy(key, values, columnValues);
  }

  async updateWith(criteria: any[][] = [], columnValues: any): Promise<void> {
    await this.#adapter.updateWith(criteria, columnValues);
  }

  async insertAll(columns: string[], values: any[]): Promise<void> {
    await this.#adapter.insertAll(columns, values, this.#options.insertIDs || []);
  }
}

Object.freeze(ModelCollection.prototype);