import { describe, test, expect, spyOn, mock } from "bun:test";
import HelperBootstrap from "../../src/helper/central/Bootstrap.mts";

describe('HelperBootstrap Source', () => {

  test('instantiation', () => {
    new HelperBootstrap();
  });

  test('init imports bootstrap and import files', async () => {
     const adapter = {
         import: mock().mockResolvedValue({})
     };
     const APP_PATH = "/app";
     
     await HelperBootstrap.init(adapter as any, APP_PATH);
     
     expect(adapter.import).toHaveBeenCalledTimes(2);
     expect(adapter.import).toHaveBeenCalledWith(`${APP_PATH}/bootstrap`, expect.any(Number));
     expect(adapter.import).toHaveBeenCalledWith(`${APP_PATH}/import`, expect.any(Number));
  });

  test('init suppresses ModuleNotFoundError and ResolveMessage', async () => {
    const adapter = {
        import: mock().mockImplementation(() => {
            const e = new Error("Not Found");
            e.constructor = { name: 'ModuleNotFoundError' };
            throw e;
        })
    };
    
    // Should not throw
    await HelperBootstrap.init(adapter as any, "/app");
    expect(adapter.import).toHaveBeenCalled();
  });

  test("init throws other errors", async () => {
     const adapter = {
        import: mock().mockImplementation(() => {
            throw new Error("Other Error");
        })
    };
    
    expect(HelperBootstrap.init(adapter as any, "/app")).rejects.toThrow("Other Error");
  });
  
  test('init increments loadID', async () => {
      const initialID = HelperBootstrap.loadID;
      const adapter = { import: mock().mockResolvedValue({}) };
       await HelperBootstrap.init(adapter as any, "/app");
       expect(HelperBootstrap.loadID).toBe(initialID + 1);
  });

  test('loadRoutes imports routes', async () => {
       const adapter = {
         import: mock().mockResolvedValue({})
     };
     const APP_PATH = "/app";
     await HelperBootstrap.loadRoutes(adapter as any, APP_PATH);
     expect(adapter.import).toHaveBeenCalledWith(`${APP_PATH}/routes`, expect.any(Number));
  });

   test('loadRoutes suppresses ModuleNotFoundError', async () => {
    const adapter = {
        import: mock().mockImplementation(() => {
            const e = new Error("Not Found");
            e.constructor = { name: 'ModuleNotFoundError' };
            throw e;
        })
    };
    
    await HelperBootstrap.loadRoutes(adapter as any, "/app");
    expect(adapter.import).toHaveBeenCalled();
  });
  
  test("loadRoutes throws other errors", async () => {
     const adapter = {
         import: mock().mockImplementation(() => {
            throw new Error("Other Error");
        })
    };
    expect(HelperBootstrap.loadRoutes(adapter as any, "/app")).rejects.toThrow("Other Error");
  });

});
