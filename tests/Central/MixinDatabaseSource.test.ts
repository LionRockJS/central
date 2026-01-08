import { describe, test, expect, mock } from "bun:test";
import { Controller } from '@lionrockjs/mvc';
import ControllerMixinDatabase from '../../src/controller-mixin/Database.mts';
import Central from '../../src/Central.mts';
import DatabaseAdapter from '../../src/adapter/Database.mts';

describe('Mixin Database Source', () => {

    test('init and default setup', () => {
        const state = new Map();
        ControllerMixinDatabase.init(state);
        
        expect(state.has(ControllerMixinDatabase.DATABASE_MAP)).toBe(true);
        expect(state.has(ControllerMixinDatabase.DATABASES)).toBe(true);
    });
    
    test('controller usage', async () => {
        // Setup Central with a mock config for databases
        // Assuming Central.config.database is accessed or we just manually map in init
        
        class C extends Controller {
             static mixins = [ControllerMixinDatabase];
        }
        
        const c = new C({});
        // Mixin init is called by Controller constructor usually, 
        // but Controller from mvc might rely on compiled mixins? 
        // No, if I pass the class C which has static mixins array, 
        // the Controller constructor iterates it and calls init.
        
        // Wait, ControllerMixinDatabase.init(state) is static.
        
        expect(c.state.has(ControllerMixinDatabase.DATABASE_MAP)).toBe(true);
    });

    test('setup creates connections', async () => {
        const state = new Map();
        
        // Setup state manually as init would
        state.set(ControllerMixinDatabase.DATABASE_MAP, new Map());
        state.set(ControllerMixinDatabase.DATABASES, new Map());
        
        // Mock adapter
        const mockAdapter = {
            create: mock((config) => ({ config, isConnection: true }))
        };
        state.set(ControllerMixinDatabase.DATABASE_ADAPTER, mockAdapter);
        
        // Add config
        state.get(ControllerMixinDatabase.DATABASE_MAP).set('db1', 'config1');
        
        // Run setup
        await ControllerMixinDatabase.setup(state);
        
        const dbs = state.get(ControllerMixinDatabase.DATABASES);
        expect(dbs.has('db1')).toBe(true);
        expect(dbs.get('db1').isConnection).toBe(true);
        expect(mockAdapter.create).toHaveBeenCalledWith('config1');
        
        // Test caching (private #dbConnection)
        // If we call setup again with same map keys/values, explicitly check logic?
        // #getConnections uses a hash of map keys+values.
        
        await ControllerMixinDatabase.setup(state);
        // Should reuse connection, but hard to verify without spying on #getConnections which is private.
        // But we can check if mockAdapter.create is NOT called again.
        
        expect(mockAdapter.create).toHaveBeenCalledTimes(1);
    });
    
    test('setup handles creation error', async () => {
        const state = new Map();
        state.set(ControllerMixinDatabase.DATABASE_MAP, new Map());
        state.set(ControllerMixinDatabase.DATABASES, new Map());
        
        const mockAdapter = {
            create: mock(() => { throw new Error("Connection failed") })
        };
        state.set(ControllerMixinDatabase.DATABASE_ADAPTER, mockAdapter);
        state.get(ControllerMixinDatabase.DATABASE_MAP).set('db1', 'config1');
        
        try {
            await ControllerMixinDatabase.setup(state);
        } catch(e) {
            expect(e.message).toBe("Connection failed");
        }
    });

});
