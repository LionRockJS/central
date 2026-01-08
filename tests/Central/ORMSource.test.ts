import { describe, test, expect, mock, spyOn } from "bun:test";
import ORM from "../../src/ORM.mts";
import Model from "../../src/Model.mts";
import Central from "../../src/Central.mts";

class MockCollection {
    async readAll(cols) { return []; }
    async readBy(k, v, cols) { return []; }
    async readWith(crit, cols) { return []; }
    async countAll() { return 10; }
    async countBy(k, v) { return 5; }
    async countWith(crit) { return 3; }
    async deleteAll() {}
    async deleteBy(k, v) {}
    async deleteWith(crit) { return 1; }
    async updateAll(kv, cv) {}
    async updateBy(k, v, cv) {}
    async updateWith(crit, cv) {}
    async insertAll(cols, vals) {}
}

class MockModel extends Model {
    static fields = new Set(['name', 'age']);
    static belongsTo = new Set(['parent']);
    
    mockCollection = new MockCollection();

    constructor(id = null, options = {}) {
        super(id, options);
    }
    
    async read(columns) { return this; }
    
    getCollection() { return this.mockCollection; }
    
    async eagerLoad(options) { return; }
    
    async write() { return this; }
}

describe("ORM Source", () => {
    test("create returns model instance", () => {
        const m = ORM.create(MockModel);
        expect(m).toBeInstanceOf(MockModel);
    });

    test("factory returns model instance loaded", async () => {
        const m = await ORM.factory(MockModel, 1);
        expect(m).toBeInstanceOf(MockModel);
    });

    test("readAll calls collection readAll", async () => {
        const mockFn = spyOn(MockCollection.prototype, 'readAll').mockResolvedValue([{ name: 'test' }, { name: 'test2' }]);
        const result = await ORM.readAll(MockModel);
        
        expect(mockFn).toHaveBeenCalled();
        expect(result).toBeArray();
        expect(result[0]).toBeInstanceOf(MockModel);
        expect(result[0].name).toBe('test');
        expect(result).toHaveLength(2);
        mockFn.mockRestore();
    });
    
    test("readAll returns null if empty", async () => {
        const mockFn = spyOn(MockCollection.prototype, 'readAll').mockResolvedValue([]);
        const result = await ORM.readAll(MockModel);
        expect(result).toBeNull();
        mockFn.mockRestore();
    });

    test("readBy calls collection readBy", async () => {
        const mockFn = spyOn(MockCollection.prototype, 'readBy').mockResolvedValue([{ name: 'test' }]);
        const result = await ORM.readBy(MockModel, 'id', [1]);
        
        expect(mockFn).toHaveBeenCalled();
        expect(result).toBeInstanceOf(MockModel); // Single result returns object
        mockFn.mockRestore();
    });

    test("readWith calls collection readWith", async () => {
        const mockFn = spyOn(MockCollection.prototype, 'readWith').mockResolvedValue([{ name: 'test' }, { name: 'test2' }]);
        const result = await ORM.readWith(MockModel, [['id', '=', 1]]);
        
        expect(mockFn).toHaveBeenCalled();
        expect(result).toBeArray();
        expect(result).toHaveLength(2);
        mockFn.mockRestore();
    });

    test("readWith returns empty array if no criteria", async () => {
        const result = await ORM.readWith(MockModel, []);
        expect(result).toEqual([]);
    });

    test("countAll calls collection countAll", async () => {
        const mockFn = spyOn(MockCollection.prototype, 'countAll').mockResolvedValue(10);
        const result = await ORM.countAll(MockModel);
        expect(mockFn).toHaveBeenCalled();
        expect(result).toBe(10);
        mockFn.mockRestore();
    });

    test("countBy calls collection countBy", async () => {
        const mockFn = spyOn(MockCollection.prototype, 'countBy').mockResolvedValue(5);
        const result = await ORM.countBy(MockModel, 'cat', ['a']);
        expect(mockFn).toHaveBeenCalled();
        expect(result).toBe(5);
        mockFn.mockRestore();
    });

    test("countWith calls collection countWith", async () => {
        const mockFn = spyOn(MockCollection.prototype, 'countWith').mockResolvedValue(3);
        const result = await ORM.countWith(MockModel, [['id', '=', 1]]);
        expect(mockFn).toHaveBeenCalled();
        expect(result).toBe(3);
        mockFn.mockRestore();
    });
    
    test("countWith throws on empty criteria", async () => {
        expect(ORM.countWith(MockModel, [])).rejects.toThrow();
    });

    test("deleteAll calls collection deleteAll", async () => {
        const mockFn = spyOn(MockCollection.prototype, 'deleteAll');
        await ORM.deleteAll(MockModel);
        expect(mockFn).toHaveBeenCalled();
        mockFn.mockRestore();
    });

    test("deleteBy calls collection deleteBy", async () => {
        const mockFn = spyOn(MockCollection.prototype, 'deleteBy');
        await ORM.deleteBy(MockModel, 'id', [1]);
        expect(mockFn).toHaveBeenCalled();
        mockFn.mockRestore();
    });

    test("deleteWith calls collection deleteWith", async () => {
        const mockFn = spyOn(MockCollection.prototype, 'deleteWith');
        await ORM.deleteWith(MockModel, [['id', '=', 1]]);
        expect(mockFn).toHaveBeenCalled();
        mockFn.mockRestore();
    });

    test("deleteWith throws on empty criteria", async () => {
        expect(ORM.deleteWith(MockModel, [])).rejects.toThrow();
    });

    test("updateAll calls collection updateAll", async () => {
        const mockFn = spyOn(MockCollection.prototype, 'updateAll');
        await ORM.updateAll(MockModel, {}, {});
        expect(mockFn).toHaveBeenCalled();
        mockFn.mockRestore();
    });
    
    test("updateBy calls collection updateBy", async () => {
        const mockFn = spyOn(MockCollection.prototype, 'updateBy');
        await ORM.updateBy(MockModel, 'id', [1], {});
        expect(mockFn).toHaveBeenCalled();
        mockFn.mockRestore();
    });

    test("updateWith calls collection updateWith", async () => {
        const mockFn = spyOn(MockCollection.prototype, 'updateWith');
        await ORM.updateWith(MockModel, [['id', '=', 1]], new Map([['a', 1]]));
        expect(mockFn).toHaveBeenCalled();
        mockFn.mockRestore();
    });

    test("updateWith throws if criteria empty", async () => {
        expect(ORM.updateWith(MockModel, [], new Map())).rejects.toThrow();
    });

    test("updateWith throws if values empty", async () => {
        expect(ORM.updateWith(MockModel, [['id', '=', 1]], null)).rejects.toThrow();
    });

    test("insertAll calls collection insertAll", async () => {
        const mockFn = spyOn(MockCollection.prototype, 'insertAll');
        await ORM.insertAll(MockModel, ['name', 'age'], [['test', 20]]);
        expect(mockFn).toHaveBeenCalled();
        mockFn.mockRestore();
    });

    test("insertAll throws on invalid column", async () => {
        expect(ORM.insertAll(MockModel, ['invalid'], [['test']])).rejects.toThrow();
    });
    
    test("insertAll allows id column", async () => {
        const mockFn = spyOn(MockCollection.prototype, 'insertAll');
        await ORM.insertAll(MockModel, ['id', 'name'], [[1, 'test']]);
        expect(mockFn).toHaveBeenCalled();
        mockFn.mockRestore();
    });

    test("import delegate to Central", async () => {
        const spy = spyOn(Central, 'import').mockResolvedValue(MockModel);
        const result = await ORM.import('TestModel');
        expect(spy).toHaveBeenCalledWith('model/TestModel');
        expect(result).toBe(MockModel);
        spy.mockRestore();
    });

    test("import returns default if failed", async () => {
      const spy = spyOn(Central, 'import').mockRejectedValue(new Error('fail'));
      const result = await ORM.import('FailModel', MockModel);
      expect(result).toBe(MockModel);
      spy.mockRestore();
    });
    
    test("import throws if failed and no default", async () => {
       const spy = spyOn(Central, 'import').mockRejectedValue(new Error('fail'));
       expect(ORM.import('FailModel')).rejects.toThrow('fail');
       spy.mockRestore();
    });
    
    test("eagerLoad", async () => {
        const m = new MockModel();
        const spy = spyOn(m, 'eagerLoad');
        await ORM.eagerLoad([m], { with: true });
        expect(spy).toHaveBeenCalled();
    });
    
    test("eagerLoad skips if empty or no with", async () => {
        const m = new MockModel();
        const spy = spyOn(m, 'eagerLoad');
        await ORM.eagerLoad([], { with: true });
        expect(spy).not.toHaveBeenCalled();
        
        await ORM.eagerLoad([m], { });
        expect(spy).not.toHaveBeenCalled();
    });
    
    test("write calls model write", async () => {
        const m = new MockModel();
        const spy = spyOn(m, 'write');
        await ORM.write(m);
        expect(spy).toHaveBeenCalled();
    });
});
