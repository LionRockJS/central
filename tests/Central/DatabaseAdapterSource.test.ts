import { describe, test, expect, spyOn, mock } from "bun:test";
import DatabaseAdapter from "../../src/adapter/Database.mts";

describe('Database Adapter Source Source', () => {
  const datasource = "test-datasource";

  test('constructor and create', () => {
    const instance = new DatabaseAdapter(datasource);
    expect(instance).toBeInstanceOf(DatabaseAdapter);

    const instance2 = DatabaseAdapter.create(datasource);
    expect(instance2).toBeInstanceOf(DatabaseAdapter);
  });

  test('prepare statement', async () => {
    const instance = new DatabaseAdapter(datasource);
    const statement = instance.prepare('SELECT * FROM test');
    
    expect(statement.constructor.name).toBe('DatabaseStatement');
    
    // Test base implementation returns empty/void
    expect(await statement.run({})).toBeUndefined();
    expect(await statement.get({})).toEqual({});
    expect(await statement.all({})).toEqual([]);
  });

  test('transaction success flow', async () => {
    const instance = new DatabaseAdapter(datasource);
    
    // Spy on methods to verify calls
    const startSpy = spyOn(instance, 'transactionStart');
    const commitSpy = spyOn(instance, 'transactionCommit');
    const rollbackSpy = spyOn(instance, 'transactionRollback');
    
    const work = mock(async () => {
      return "done";
    });

    await instance.transaction(work);

    expect(startSpy).toHaveBeenCalled();
    expect(work).toHaveBeenCalled();
    expect(commitSpy).toHaveBeenCalled();
    expect(rollbackSpy).not.toHaveBeenCalled();
  });

  test('transaction failure flow', async () => {
    const instance = new DatabaseAdapter(datasource);
    
    const startSpy = spyOn(instance, 'transactionStart');
    const commitSpy = spyOn(instance, 'transactionCommit');
    const rollbackSpy = spyOn(instance, 'transactionRollback');
    
    const error = new Error("Transaction failed");
    const work = mock(async () => {
      throw error;
    });

    try {
      await instance.transaction(work);
    } catch (e) {
      expect(e).toBe(error);
    }

    expect(startSpy).toHaveBeenCalled();
    expect(work).toHaveBeenCalled();
    expect(commitSpy).not.toHaveBeenCalled();
    expect(rollbackSpy).toHaveBeenCalled();
  });

  test('exec and close and checkpoint', async () => {
    const instance = new DatabaseAdapter(datasource);
    
    // These just shouldn't throw
    await instance.exec('SELECT 1');
    await instance.close();
    await instance.checkpoint();
  });
});
