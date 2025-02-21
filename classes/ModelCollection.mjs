export default class ModelCollection{
  #adapter;
  #options;
  #columns;

  constructor(adapter, options, columns){
    this.#adapter = adapter;
    this.#options = options;
    this.#columns = columns;
  }

  async readAll(columns = this.#columns){
    return await this.#adapter.readAll(this.#options.kv, columns, this.#options.limit, this.#options.offset, this.#options.orderBy);
  }

  async readBy(key, values, columns = this.#columns){
    return await this.#adapter.readBy(key, values, columns, this.#options.limit, this.#options.offset, this.#options.orderBy);
  }

  async readWith(criteria, columns= this.#columns){
    return await this.#adapter.readWith(criteria, columns, this.#options.limit, this.#options.offset, this.#options.orderBy);
  }

  async countAll(){
    return await this.#adapter.countAll(this.#options.kv);
  }

  async countBy(key, values){
    return await this.#adapter.countBy(key, values);
  }

  async countWith(criteria=[]){
    return await this.#adapter.countWith(criteria);
  }

  async deleteAll(){
    await this.#adapter.deleteAll(this.#options.kv);
  }

  async deleteBy(key, values){
    await this.#adapter.deleteBy(key, values);
  }

  async deleteWith(criteria=[]){
    await this.#adapter.deleteWith(criteria);
  }

  async updateAll(kv, columnValues){
    await this.#adapter.updateAll(kv, columnValues);
  }

  async updateBy(key, values, columnValues){
    await this.#adapter.updateBy(key, values, columnValues);
  }

  async updateWith(criteria=[], columnValues){
    await this.#adapter.updateWith(criteria, columnValues);
  }

  async insertAll(columns, values){
    await this.#adapter.insertAll(columns, values, this.#options.insertIDs || []);
  }
}

Object.freeze(ModelCollection.prototype);