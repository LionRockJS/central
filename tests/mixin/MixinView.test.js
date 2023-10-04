import {Controller, View} from '@lionrockjs/mvc';
import ControllerMixinView from '../../classes/controller-mixin/View';

describe('Controller Mixin View Test', () => {
  test('constructor', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];
    }
    const c = new C({});

    expect(typeof ControllerMixinView.setLayout).toBe('function');
    expect(typeof ControllerMixinView.setTemplate).toBe('function');
    expect(typeof ControllerMixinView.setErrorTemplate).toBe('function');
    expect(typeof c.state.get(ControllerMixinView.TEMPLATE)).toBe('undefined');
    expect(typeof c.state.get(ControllerMixinView.ERROR_TEMPLATE)).toBe('undefined');
    expect(typeof c.state.get(ControllerMixinView.LAYOUT)).toBe('object');
  });

  test('execute', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];
    }
    const c = new C({});
    c.headers['Content-Type'] = 'text/html';
    Object.assign(c.state.get(ControllerMixinView.LAYOUT).data, { header: 'head', footer: 'foot' });

    const r = await c.execute();
    expect(r.body).toBe('{"header":"head","footer":"foot","main":""}');
  });

  test('set template', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];
    }
    const c = new C({});
    c.headers['Content-Type'] = 'text/html';

    Object.assign(c.state.get('layout').data, { header: 'head', footer: 'foot' });
    ControllerMixinView.setTemplate(c.state,'', { content: 'hello' });

    expect(c.state.get('template').data.content).toBe('hello');
    expect(c.state.get('layout').data.header).toBe('head');

    const r = await c.execute();
    expect(r.body).toBe('{"header":"head","footer":"foot","main":"{\\"content\\":\\"hello\\"}"}');
  });

  test('errorTemplate', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];
    }
    const c = new C({});
    c.headers['Content-Type'] = 'text/html';

    c.action_test = async () => {
      throw new Error('error throw');
    };

    Object.assign(c.state.get('layout').data, { header: 'head', footer: 'foot' });
    ControllerMixinView.setErrorTemplate(c.state,'', { content: 'error' });

    const errorTemplate = c.state.get('errorTemplate');
    expect(errorTemplate.data.content).toBe('error');

    const result = await c.execute('test');
    expect(result.body).toBe('{"header":"head","footer":"foot","main":"{\\"content\\":\\"error\\",\\"body\\":\\"error throw\\"}"}');
  });

  test('errorWithoutTemplate', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];
    }
    const c = new C({});

    c.action_test = async () => {
      throw new Error('error throw');
    };

    Object.assign(c.state.get('layout').data, { header: 'head', footer: 'foot' });

    const result = await c.execute('test');
    expect(result.body).toBe('{"header":"head","footer":"foot","main":"error throw"}');
    //    const v = c.getView('')
    //    expect(await v.render()).toBe('{}');
  });

  test('set Layout', async () => {
    class C extends Controller{
      static mixins = [ControllerMixinView];
    }
    const c = new C({});
    c.headers['Content-Type'] = 'text/html';
    ControllerMixinView.setLayout(c.state, 'layout', { foo: 'bar' });

    Object.assign(c.state.get('layout').data, { header: 'head', footer: 'foot' });
    ControllerMixinView.setTemplate(c.state,'', { content: 'hello' });

    expect(c.state.get('template').data.content).toBe('hello');
    expect(c.state.get('layout').data.header).toBe('head');

    const r = await c.execute();
    expect(r.body).toBe('{"foo":"bar","header":"head","footer":"foot","main":"{\\"content\\":\\"hello\\"}"}');
  });

  test('exit with 302', async () => {
    class C extends Controller{
      static mixins = [ControllerMixinView];
    }
    const c = new C({});
    c.headers['Content-Type'] = 'text/html';

    ControllerMixinView.setLayout(c.state, 'layout', { hello: 'world' });
    ControllerMixinView.setTemplate(c.state, 'tpl', { content: 'wow' });
    c.action_test = async () => { await c.exit(302); };

    const r = await c.execute();
    expect(r.body).toBe('{"hello":"world","main":"{\\"content\\":\\"wow\\"}"}');

    const c2 = new C({});
    ControllerMixinView.setLayout(c2.state,'layout', { hello: 'world' });
    ControllerMixinView.setTemplate(c2.state, 'tpl', { content: 'wow' });
    c2.action_test = async () => { await c2.exit(302); };
    const r2 = await c2.execute('test');
    expect(r2.body).toBe('');

    const c3 = new C({});
    ControllerMixinView.setLayout(c3.state,'layout', { hello: 'world' });
    ControllerMixinView.setTemplate(c3.state,'tpl', { content: 'wow' });
    c3.action_test = async () => { await c3.exit(302); };
    const r3 = await c.execute();
    expect(r3.body).toBe('{"hello":"world","main":"{\\"content\\":\\"wow\\"}"}');
  });

  test('render json', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];

      async action_test() {
        this.body = {
          foo: 'bar',
        };
      }
    }
    const c = new C({});
    c.headers['Content-Type'] = 'application/json';
    await c.execute('test');
    expect(c.body).toBe('{"foo":"bar"}');

    const c2 = new C({});
    c2.headers['Content-Type'] = 'application/json; charset=utf-8';
    await c.execute('test');
    expect(c.body).toBe('{"foo":"bar"}');
  });

  test('render json on exit', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];

      async action_test() {
        this.body = {
          error: 'bar',
        };
        throw new Error();
      }
    }

    const c = new C({});
    c.headers['Content-Type'] = 'application/json';
    await c.execute('test');
    expect(c.body).toBe('{"error":"bar"}');
  })

  test('direct assign view', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];
      constructor(request) {
        super(request);
        ControllerMixinView.setLayout(this.state, {render:()=>"layout", data:{}}, {});
        ControllerMixinView.setTemplate(this.state, {render:()=>'template', data:{}}, {});
        ControllerMixinView.setErrorTemplate(this.state, {render:()=>'error_tpl', data:{}}, {});
      }
      async action_test() {
        this.body = {
          foo: 'bar',
        };
      }
    }

    const c = new C({});
    await c.execute('test');
    expect(c.body).toBe('{"main":"template"}');
  });

  test('direct assign view, without data', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];
      constructor(request) {
        super(request);
        ControllerMixinView.setLayout(this.state, {render:()=>"layout", data:{}});
        ControllerMixinView.setTemplate(this.state, {render:()=>'template', data:{}});
        ControllerMixinView.setErrorTemplate(this.state, {render:()=>'error_tpl', data:{}});
      }
      async action_test() {
        this.body = {
          foo: 'bar',
        };
      }
    }

    const c = new C({});
    await c.execute('test');
    expect(c.body).toBe('{"main":"template"}');
  });

  test('mixin view with assigned properties', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];
      constructor(request) {
        super(request,
          new Map([
            [ControllerMixinView.LAYOUT_FILE, 'foo/bar'],
            [ControllerMixinView.PLACEHOLDER, 'base'],
            [ControllerMixinView.VIEW_CLASS, View.DefaultViewClass],
            [ControllerMixinView.LAYOUT_DEFAULT_DATA, {}],
            [ControllerMixinView.VIEW_DEFAULT_DATA, {}],
            [ControllerMixinView.LAYOUT, {data:{}}]
          ])
        );
      }
      async action_test() {
        this.body = {
          foo: 'bar',
        };
      }
    }
    const c = new C({});
    await c.execute('test');

    expect(c.body).toBe('{"base":{"foo":"bar"}}');

  });
});
