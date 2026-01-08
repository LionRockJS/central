import { describe, test, expect, mock } from "bun:test";
import ModelCollection from "../../src/ModelCollection.mts";

describe('ModelCollection Source', () => {
  test('constructor', () => {
    const adapter = {};
    const options = {};
    const columns = ['id'];
    const instance = new ModelCollection(adapter, options, columns);
    expect(instance).toBeInstanceOf(ModelCollection);
  });

  test('methods delegation', async () => {
    const adapter = {
        readAll: mock(() => Promise.resolve(['readAll'])),
        readBy: mock(() => Promise.resolve(['readBy'])),
        readWith: mock(() => Promise.resolve(['readWith'])),
        countAll: mock(() => Promise.resolve(1)),
        countBy: mock(() => Promise.resolve(2)),
        countWith: mock(() => Promise.resolve(3)),
        deleteAll: mock(() => Promise.resolve()),
        deleteBy: mock(() => Promise.resolve()),
        deleteWith: mock(() => Promise.resolve())
    };

    const options = {
        kv: { a: 1 },
        limit: 10,
        offset: 0,
        orderBy: new Map()
    };
    const columns = ['id', 'name'];
    const instance = new ModelCollection(adapter, options, columns);

    expect(await instance.readAll()).toEqual(['readAll']);
    expect(adapter.readAll).toHaveBeenCalledWith(options.kv, columns, options.limit, options.offset, options.orderBy);

    expect(await instance.readBy('k', ['v'])).toEqual(['readBy']);
    expect(adapter.readBy).toHaveBeenCalledWith('k', ['v'], columns, options.limit, options.offset, options.orderBy);

    expect(await instance.readWith([['c']])).toEqual(['readWith']);
    expect(adapter.readWith).toHaveBeenCalledWith([['c']], columns, options.limit, options.offset, options.orderBy);

    expect(await instance.countAll()).toBe(1);
    expect(adapter.countAll).toHaveBeenCalledWith(options.kv);

    expect(await instance.countBy('k', ['v'])).toBe(2);
    expect(adapter.countBy).toHaveBeenCalledWith('k', ['v']);

    expect(await instance.countWith([['c']])).toBe(3);
    expect(adapter.countWith).toHaveBeenCalledWith([['c']]);

    await instance.deleteAll();
    expect(adapter.deleteAll).toHaveBeenCalledWith(options.kv);

    await instance.deleteBy('k', ['v']);
    expect(adapter.deleteBy).toHaveBeenCalledWith('k', ['v']);
  });
  
    test('methods delegation with explicit columns', async () => {
    const adapter = {
        readAll: mock(() => Promise.resolve(['readAll'])),
        readBy: mock(() => Promise.resolve(['readBy'])),
        readWith: mock(() => Promise.resolve(['readWith'])),
    };

    const options = {
        kv: { a: 1 },
        limit: 10,
        offset: 0,
        orderBy: new Map()
    };
    const columns = ['id', 'name'];
    const instance = new ModelCollection(adapter, options, columns);

    const explicitColumns = ['id'];

    expect(await instance.readAll(explicitColumns)).toEqual(['readAll']);
    expect(adapter.readAll).toHaveBeenCalledWith(options.kv, explicitColumns, options.limit, options.offset, options.orderBy);

    expect(await instance.readBy('k', ['v'], explicitColumns)).toEqual(['readBy']);
    expect(adapter.readBy).toHaveBeenCalledWith('k', ['v'], explicitColumns, options.limit, options.offset, options.orderBy);

    expect(await instance.readWith([['c']], explicitColumns)).toEqual(['readWith']);
    expect(adapter.readWith).toHaveBeenCalledWith([['c']], explicitColumns, options.limit, options.offset, options.orderBy);
  });
  
    test('methods delegation deleteWith', async () => {
    const adapter = {
        deleteWith: mock(() => Promise.resolve())
    };

    const options = {
        kv: { a: 1 },
        limit: 10,
        offset: 0,
        orderBy: new Map()
    };
    const columns = ['id', 'name'];
    const instance = new ModelCollection(adapter, options, columns);

    await instance.deleteWith([['c']]);
    expect(adapter.deleteWith).toHaveBeenCalledWith([['c']]);

    // Test default arg
    // Since I can't easily see the source for deleteWith default arg right now, assuming criteria might have default?
    // Actually source lines 31 just shows countWith has default = []
    // Let's check the source for deleteWith
  });
});
