import { describe, test, expect, spyOn, mock } from "bun:test";
import ORM from "../../src/adapter/ORM.mts";
import Model from "../../src/Model.mts";

class MockModel extends Model {
  static tableName = "test_table";
  id: number = 1;
  name: string = "test";
  
  getColumns() {
    return ["id", "name"];
  }
}

describe('ORM Adapter Source', () => {
  const mockDatabase = {};
  
  test('constructor', () => {
    const model = new MockModel();
    const orm = new ORM(model, mockDatabase);
    expect(orm).toBeInstanceOf(ORM);
    expect(orm.client).toBe(model);
    expect(orm.database).toBe(mockDatabase);
    expect(orm.tableName).toBe("test_table");
  });

  test('static methods', () => {
    expect(typeof ORM.defaultID()).toBe("number");
    expect(typeof ORM.uuid()).toBe("string");
    const values = [1, 2, 3];
    expect(ORM.translateValue(values)).toBe(values);
  });

  test('processValues', () => {
    const model = new MockModel();
    const orm = new ORM(model, mockDatabase);
    
    // Default translateValue returns values as is
    const values = orm.processValues();
    expect(values).toEqual([1, "test"]);
  });

  test('base methods return defaults', async () => {
    const model = new MockModel();
    const orm = new ORM(model, mockDatabase);

    expect(await orm.read()).toBeUndefined();
    expect(await orm.update([])).toBeUndefined();
    expect(await orm.insert([])).toBeUndefined();
    expect(await orm.delete()).toBeUndefined();
    
    expect(await orm.hasMany("other_table", "key")).toEqual([]);
    expect(await orm.belongsToMany("target", "joint", "lk", "fk")).toEqual([]);
    
    expect(await orm.add([], 1, "joint", "lk", "fk")).toBeUndefined();
    expect(await orm.remove([], "joint", "lk", "fk")).toBeUndefined();
    expect(await orm.removeAll("joint", "lk")).toBeUndefined();
    
    expect(await orm.readAll(new Map())).toEqual([]);
    expect(await orm.readBy("key", [])).toEqual([]);
    expect(await orm.readWith([[]])).toEqual([]); // fix signature if needed
    
    expect(await orm.countAll()).toBe(0);
    expect(await orm.countBy("key", [])).toBe(0);
    expect(await orm.countWith([[]])).toBe(0);
  });
});
