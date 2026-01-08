import { describe, test, expect, mock, spyOn } from "bun:test";
import ActionLogger, { ActionLoggerState } from "../../src/controller-mixin/ActionLogger.mts";
import { ControllerState } from '@lionrockjs/mvc';
import Central from "../../src/Central.mts";
import fs from 'node:fs/promises';

describe('ActionLogger Source', () => {
    test('instantiation', () => {
        new ActionLogger();
    });

  test('init', () => {
    const state = new Map();
    ActionLogger.init(state);
    expect(state.get(ActionLoggerState.LOG_ACTIONS)).toBeInstanceOf(Set);
    expect(state.get(ActionLoggerState.LOG_ACTIONS).has('update')).toBe(true);
  });

  test('init does not overwrite', () => {
    const state = new Map();
    const existing = new Set(['foo']);
    state.set(ActionLoggerState.LOG_ACTIONS, existing);
    ActionLogger.init(state);
    expect(state.get(ActionLoggerState.LOG_ACTIONS)).toBe(existing);
  });

  test('before logs action', async () => {
    const state = new Map();
    state.set(ActionLoggerState.LOG_ACTIONS, new Set(['test_action']));
    state.set(ControllerState.REQUEST, { session: { logged_in: true, user_id: '123' }});
    state.set(ControllerState.ACTION, 'test_action');
    state.set(ControllerState.CLIENT_IP, '127.0.0.1');
    state.set(ControllerState.PARAMS, { p: 1 });

    const originalConfig = Central.config;
    Central.config = { admin: { logPath: '/tmp/logs' } } as any;

    const mkdirSpy = spyOn(fs, 'mkdir').mockImplementation(() => Promise.resolve(""));
    const appendFileSpy = spyOn(fs, 'appendFile').mockImplementation(() => Promise.resolve());

    await ActionLogger.before(state);

    expect(mkdirSpy).toHaveBeenCalled();
    expect(appendFileSpy).toHaveBeenCalled();
    
    // Check call arguments for path construction logic
    const appendCall = appendFileSpy.mock.calls[0];
    const logContent = JSON.parse(appendCall[1] as string);
    expect(logContent.user).toBe('123');
    expect(logContent.ip).toBe('127.0.0.1');

    mkdirSpy.mockRestore();
    appendFileSpy.mockRestore();
    Central.config = originalConfig;
  });
  
  test('before ignores non-logged actions', async () => {
     const state = new Map();
    state.set(ActionLoggerState.LOG_ACTIONS, new Set(['other_action']));
    state.set(ControllerState.REQUEST, { session: { }});
    state.set(ControllerState.ACTION, 'test_action');

    const originalConfig = Central.config;
    Central.config = { admin: { logPath: '/tmp/logs' } } as any;
    
    const mkdirSpy = spyOn(fs, 'mkdir');
    
    await ActionLogger.before(state);
    
    expect(mkdirSpy).not.toHaveBeenCalled();
    
    mkdirSpy.mockRestore();
    Central.config = originalConfig;
  });

   test('before logs when LOG_ACTIONS_ALL', async () => {
     const state = new Map();
    state.set(ActionLoggerState.LOG_ACTIONS, ActionLoggerState.LOG_ACTIONS_ALL);
    state.set(ControllerState.REQUEST, { session: { }});
    state.set(ControllerState.ACTION, 'any_action');

    const originalConfig = Central.config;
    Central.config = { admin: { logPath: '/tmp/logs' } } as any;
    
    const mkdirSpy = spyOn(fs, 'mkdir').mockImplementation(() => Promise.resolve(""));
    const appendFileSpy = spyOn(fs, 'appendFile').mockImplementation(() => Promise.resolve());
    
    await ActionLogger.before(state);
    
    expect(mkdirSpy).toHaveBeenCalled();
    
    mkdirSpy.mockRestore();
    appendFileSpy.mockRestore();
    Central.config = originalConfig;
  });

  test('before exits if no logPath', async () => {
       const state = new Map();
    state.set(ActionLoggerState.LOG_ACTIONS, ActionLoggerState.LOG_ACTIONS_ALL);
    state.set(ControllerState.REQUEST, { session: { }});
    state.set(ControllerState.ACTION, 'any_action');
    
    const originalConfig = Central.config;
    Central.config = { admin: {} } as any; // No logPath

    const mkdirSpy = spyOn(fs, 'mkdir');

    await ActionLogger.before(state);

    expect(mkdirSpy).not.toHaveBeenCalled();
    
    mkdirSpy.mockRestore();
     Central.config = originalConfig;
  });
  
  test('before handles errors gracefully', async () => {
    const state = new Map();
    state.set(ActionLoggerState.LOG_ACTIONS, ActionLoggerState.LOG_ACTIONS_ALL);
    state.set(ControllerState.REQUEST, { session: { }});
    state.set(ControllerState.ACTION, 'any_action');
    
    const originalConfig = Central.config;
     Central.config = { admin: { logPath: '/tmp/logs' } } as any;

    const mkdirSpy = spyOn(fs, 'mkdir').mockImplementation(() => { throw new Error("FS Error") });
    const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});

    await ActionLogger.before(state);

    expect(consoleSpy).toHaveBeenCalledWith('ActionLogger failed to write log:', expect.any(Error));

    mkdirSpy.mockRestore();
    consoleSpy.mockRestore();
    Central.config = originalConfig;
  });

  test('before exits if config.admin undefined', async () => {
    const state = new Map();
    state.set(ActionLoggerState.LOG_ACTIONS, ActionLoggerState.LOG_ACTIONS_ALL);
    state.set(ControllerState.REQUEST, { session: { }});
    state.set(ControllerState.ACTION, 'any_action');
    
    const originalConfig = Central.config;
    Central.config = {} as any; // admin undefined

    const mkdirSpy = spyOn(fs, 'mkdir');

    await ActionLogger.before(state);

    expect(mkdirSpy).not.toHaveBeenCalled();
    
    mkdirSpy.mockRestore();
     Central.config = originalConfig;
  });

});
