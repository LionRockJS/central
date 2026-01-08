import { describe, test, expect } from "bun:test";
import Mime from "../../src/controller-mixin/Mime.mts";
import { ControllerState } from '@lionrockjs/mvc';

describe('Mime Source', () => {
    test('instantiation', () => {
        new Mime();
    });

    test('init sets content type based on url', () => {
        const state = new Map();
        const headers = {};
        const request = { url: '/test.json' };
        
        state.set(ControllerState.HEADERS, headers);
        state.set(ControllerState.REQUEST, request);
        
        Mime.init(state);
        
        expect(headers['Content-Type']).toContain('application/json');
        expect(headers['Content-Type']).toContain('charset=utf-8');
    });

    test('init defaults to text/html', () => {
        const state = new Map();
        const headers = {};
        const request = { url: '/test' };
        
        state.set(ControllerState.HEADERS, headers);
        state.set(ControllerState.REQUEST, request);
        
        Mime.init(state);
        
        expect(headers['Content-Type']).toContain('text/html');
        expect(headers['Content-Type']).toContain('charset=utf-8');
    });
});
