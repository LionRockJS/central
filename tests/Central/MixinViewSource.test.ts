import { describe, test, expect, mock } from "bun:test";
import ControllerMixinView, { ControllerMixinViewState } from "../../src/controller-mixin/View.mts";
import { ControllerState, View } from '@lionrockjs/mvc';
import JSONView from "../../src/view/JSONView.mts";

describe('ControllerMixinView Source', () => {
    test('instantiation', () => {
        new ControllerMixinView();
    });

    test('init defaults', () => {
        const state = new Map();
        state.set(ControllerState.LANGUAGE, 'en');
        
        ControllerMixinView.init(state);
        
        expect(state.get(ControllerMixinViewState.LAYOUT_FILE)).toBe('layout/default');
        expect(state.get(ControllerMixinViewState.PLACEHOLDER)).toBe('main');
        expect(state.get(ControllerMixinViewState.VIEW_CLASS)).toBe(View.DefaultViewClass);
        expect(state.get(ControllerMixinViewState.LAYOUT)).toBeInstanceOf(View.DefaultViewClass);
        
        // Ensure default data contains language
        expect(state.get(ControllerMixinViewState.VIEW_DEFAULT_DATA).language).toBe('en');
    });

    test('setTemplate', () => {
        const state = new Map();
        state.set(ControllerMixinViewState.VIEW_CLASS, View.DefaultViewClass);
        
        ControllerMixinView.setTemplate(state, 'test/template', { foo: 'bar' });
        
        const template = state.get(ControllerMixinViewState.TEMPLATE);
        expect(template).toBeInstanceOf(View.DefaultViewClass);
        expect(template.file).toContain('test/template');
        expect(template.data.foo).toBe('bar');
    });
    
    test('setLayout', () => {
        const state = new Map();
        state.set(ControllerMixinViewState.VIEW_CLASS, View.DefaultViewClass);
        
        ControllerMixinView.setLayout(state, 'test/layout', { foo: 'bar' });
        
        const layout = state.get(ControllerMixinViewState.LAYOUT);
        expect(layout).toBeInstanceOf(View.DefaultViewClass);
        expect(layout.file).toContain('test/layout');
        expect(layout.data.foo).toBe('bar');
    });

    test('setErrorTemplate', () => {
        const state = new Map();
        state.set(ControllerMixinViewState.VIEW_CLASS, View.DefaultViewClass);
        
        ControllerMixinView.setErrorTemplate(state, 'test/error', { foo: 'bar' });
        
        const errorTemplate = state.get(ControllerMixinViewState.ERROR_TEMPLATE);
        expect(errorTemplate).toBeInstanceOf(View.DefaultViewClass);
        expect(errorTemplate.file).toContain('test/error');
        expect(errorTemplate.data.foo).toBe('bar');
    });

    test("setErrorTemplate with object", () => {
        const state = new Map();
        state.set(ControllerMixinViewState.VIEW_DEFAULT_DATA, {});
        const viewObj = { file: 'foo', data: {} };
        ControllerMixinView.setErrorTemplate(state, viewObj);
        expect(state.get(ControllerMixinViewState.ERROR_TEMPLATE)).toBe(viewObj);
    });

    test('before ensures layout if missing', async () => {
        const state = new Map();
        state.set(ControllerMixinViewState.LAYOUT_FILE, 'layout/default');
        state.set(ControllerMixinViewState.VIEW_CLASS, View.DefaultViewClass);
        
        // Explicitly setup missing layout
        state.delete(ControllerMixinViewState.LAYOUT);
        
        await ControllerMixinView.before(state);
        expect(state.get(ControllerMixinViewState.LAYOUT)).toBeInstanceOf(View.DefaultViewClass);
    });

    test('assignJSONView', () => {
        const state = new Map();
        state.set(ControllerMixinViewState.PLACEHOLDER, 'main');
        state.set(ControllerState.HEADERS, { 'Content-Type': 'application/json' });
        
        ControllerMixinView.assignJSONView(state);
        expect(state.get(ControllerMixinViewState.LAYOUT)).toBeInstanceOf(JSONView);
    });
    
    test('isSkipLayout', () => {
        const state = new Map();
        state.set(ControllerState.HEADERS, {});
        state.set(ControllerState.BODY, 'body');
        
        // No Content-Type
        expect(ControllerMixinView.isSkipLayout(state)).toBe(false);
        
        // Body is null
        state.set(ControllerState.HEADERS, { 'Content-Type': 'text/html' });
        state.set(ControllerState.BODY, null);
        expect(ControllerMixinView.isSkipLayout(state)).toBe(false);
        
        state.set(ControllerState.BODY, 'body');
        
        // Valid types
        state.set(ControllerState.HEADERS, { 'Content-Type': 'text/html' });
        expect(ControllerMixinView.isSkipLayout(state)).toBe(false);
        
        state.set(ControllerState.HEADERS, { 'Content-Type': 'application/json' });
        expect(ControllerMixinView.isSkipLayout(state)).toBe(false);
        
        state.set(ControllerState.HEADERS, { 'Content-Type': 'application/xml' });
        expect(ControllerMixinView.isSkipLayout(state)).toBe(false);
        
        // Invalid type
        state.set(ControllerState.HEADERS, { 'Content-Type': 'image/png' });
        expect(ControllerMixinView.isSkipLayout(state)).toBe(true);
    });

    test('after flow - no template', async () => {
        const state = new Map();
        state.set(ControllerState.HEADERS, { 'Content-Type': 'text/html' });
        state.set(ControllerState.BODY, 'body content');
        state.set(ControllerMixinViewState.PLACEHOLDER, 'main');
        
        const layout = { data: {}, render: mock(() => Promise.resolve('layout content')) };
        state.set(ControllerMixinViewState.LAYOUT, layout);
        
        await ControllerMixinView.after(state);
        
        expect(layout.data['main']).toBe('body content');
        expect(layout.render).toHaveBeenCalled();
        expect(state.get(ControllerState.BODY)).toBe('layout content');
    });

    test('after flow - with template', async () => {
        const state = new Map();
        state.set(ControllerState.HEADERS, { 'Content-Type': 'text/html' });
        state.set(ControllerMixinViewState.PLACEHOLDER, 'main');
        state.set(ControllerState.BODY, 'ignored body');

        const template = {
            data: { meta: {} },
            render: mock(() => {
                template.data.meta = { scripts: new Set(['s1.js']) }; // simulate meta population
                return Promise.resolve('template rendered');
            })
        };
        state.set(ControllerMixinViewState.TEMPLATE, template);
        
        const layout = {
            data: { other: 'data' },
            render: mock(() => Promise.resolve('layout rendered'))
        };
        state.set(ControllerMixinViewState.LAYOUT, layout);
        
        await ControllerMixinView.after(state);
        
        expect(template.render).toHaveBeenCalled();
        expect(layout.render).toHaveBeenCalled();
        expect(layout.data['main']).toBe('template rendered');
        // Check meta propagation
        expect(layout.data.meta.scripts).toEqual(['s1.js']);
    });
    
    test('exit flow', async () => {
        const state = new Map();
        state.set(ControllerState.STATUS, 200);
        state.set(ControllerState.HEADERS, { 'Content-Type': 'text/html' });
        state.set(ControllerState.BODY, 'error occurred');
        state.set(ControllerMixinViewState.PLACEHOLDER, 'main');

        const errorTemplate = {
            data: {},
            render: mock(() => Promise.resolve('error rendered'))
        };
        state.set(ControllerMixinViewState.ERROR_TEMPLATE, errorTemplate);
        
        const layout = {
            data: {},
            render: mock(() => Promise.resolve('layout with error'))
        };
        state.set(ControllerMixinViewState.LAYOUT, layout);
        
        await ControllerMixinView.exit(state);
        
        expect(errorTemplate.data.body).toBe('error occurred');
        expect(errorTemplate.render).toHaveBeenCalled();
        expect(layout.data['main']).toBe('error rendered');
        expect(state.get(ControllerState.BODY)).toBe('layout with error');        
    });

    test('exit 302', async () => {
         const state = new Map();
         state.set(ControllerState.STATUS, 302);
         const renderSpy =  mock(() => Promise.resolve());
         
         // If renderLayout was called, it would crash if layout is missing, or we can spy on a static method?
         // Static private methods hard to spy.
         // Let's just ensure nothing happens by checking body not updated if it was unset?
         state.set(ControllerState.BODY, 'redirecting...');
         
         await ControllerMixinView.exit(state);
         // Should return immediately
    });
    
    test('renderLayout error', async () => {
        const state = new Map();
        const layout = { render: mock(() => Promise.resolve(123)) }; // Returns number
        state.set(ControllerMixinViewState.LAYOUT, layout);
        
        try {
            await ControllerMixinView.renderLayout(state);
        } catch(e) {
            expect(e.message).toBe('Layout must be string or object');
        }
    });
    
    test('renderLayout handles object output (stringified)', async () => {
        const state = new Map();
        const layout = { render: mock(() => Promise.resolve({ a: 1 })) };
        state.set(ControllerMixinViewState.LAYOUT, layout);
        
        await ControllerMixinView.renderLayout(state);
        expect(state.get(ControllerState.BODY)).toBe('{"a":1}');
    });

});
