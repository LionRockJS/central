import {Controller, View} from '@lionrockjs/mvc';
import ControllerMixinView from '../../classes/controller-mixin/View.mjs';

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
    c.state.get(Controller.STATE_HEADERS)['Content-Type'] = 'text/html';
    Object.assign(c.state.get(ControllerMixinView.LAYOUT).data, { header: 'head', footer: 'foot' });

    const r = await c.execute();

    expect(typeof r.body).toBe('string');
    expect(r.body).toBe('{"header":"head","footer":"foot","main":""}');
  });

  test('set template', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];
    }
    const c = new C({});
    c.state.get(Controller.STATE_HEADERS)['Content-Type'] = 'text/html';

    Object.assign(c.state.get('layout').data, { header: 'head', footer: 'foot' });
    ControllerMixinView.setTemplate(c.state,'', { content: 'hello' });

    expect(c.state.get('template').data.content).toBe('hello');
    expect(c.state.get('layout').data.header).toBe('head');

    const r = await c.execute();
    expect(typeof r.body).toBe('string');

    const result = {header: 'head', footer: 'foot', main: {content: 'hello', header: "head", footer:"foot"}, "content": "hello"};
    expect(r.body).toBe(JSON.stringify(result));
  });

  test('errorTemplate', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];
    }
    const c = new C({});
    c.state.get(Controller.STATE_HEADERS)['Content-Type'] = 'text/html';

    c.action_test = async () => {
      throw new Error('error throw');
    };

    Object.assign(c.state.get('layout').data, { header: 'head', footer: 'foot' });
    ControllerMixinView.setErrorTemplate(c.state,'', { content: 'error' });

    const errorTemplate = c.state.get('errorTemplate');
    expect(errorTemplate.data.content).toBe('error');

    const r = await c.execute('test');
    expect(typeof r.body).toBe('string');
    expect(r.body).toBe('{"header":"head","footer":"foot","main":{\"content\":\"error\",\"body\":\"error throw\"}}');
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

    const r = await c.execute('test');
    expect(typeof r.body).toBe('string');
    expect(r.body).toBe('{"header":"head","footer":"foot","main":"error throw"}');
    //    const v = c.getView('')
    //    expect(await v.render()).toBe('{}');
  });

  test('set Layout', async () => {
    class C extends Controller{
      static mixins = [ControllerMixinView];
    }
    const c = new C({});
    c.state.get(Controller.STATE_HEADERS)['Content-Type'] = 'text/html';
    ControllerMixinView.setLayout(c.state, 'layout', { foo: 'bar' });

    Object.assign(c.state.get('layout').data, { header: 'head', footer: 'foot' });
    ControllerMixinView.setTemplate(c.state,'', { content: 'hello' });

    expect(c.state.get('template').data.content).toBe('hello');
    expect(c.state.get('layout').data.header).toBe('head');

    const r = await c.execute();
    expect(typeof r.body).toBe('string');
    const expectedResult = {
      foo: "bar",
      header: "head",
      footer: "foot",
      main:{
        content: "hello",
        foo: "bar",
        header: "head",
        footer: "foot",
      },
      content: "hello"
    }
    expect(r.body).toBe(JSON.stringify(expectedResult));
  });

  test('exit with 302', async () => {
    class C extends Controller{
      static mixins = [ControllerMixinView];
    }
    const c = new C({});
    c.state.get(Controller.STATE_HEADERS)['Content-Type'] = 'text/html';

    ControllerMixinView.setLayout(c.state, 'layout', { hello: 'world' });
    ControllerMixinView.setTemplate(c.state, 'tpl', { content: 'wow' });
    c.action_test = async () => { await c.exit(302); };

    const r = await c.execute();
    expect(typeof r.body).toBe('string');
    const expectedResult = {
      hello: "world",
      main:{
        content: "wow",
        hello: "world"
      },
      content: "wow"
    }
    expect(r.body).toBe(JSON.stringify(expectedResult));

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
    const r3 = await c3.execute();
    expect(typeof r3.body).toBe('string');

    const result = {
      hello: "world",
      main: {
        content: "wow",
        hello: "world"
      },
      content: "wow"
    }
    expect(r3.body).toBe(JSON.stringify(result));
  });

  test('render json', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];

      async action_test() {
        this.state.set(Controller.STATE_BODY, { foo: 'bar' });
      }
    }
    const c = new C({});
    c.state.get(Controller.STATE_HEADERS)['Content-Type'] = 'application/json';
    const res = await c.execute('test');
    expect(res.body).toBe('{"foo":"bar"}');

    const c2 = new C({});
    c2.state.get(Controller.STATE_HEADERS)['Content-Type'] = 'application/json; charset=utf-8';

    const res2 = await c2.execute('test');
    expect(res2.body).toBe('{"foo":"bar"}');
  });

  test('render json on exit', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];

      async action_test() {
        this.state.set(Controller.STATE_BODY, {
          error: 'bar',
        });
        throw new Error();
      }
    }

    const c = new C({});
    c.state.get(Controller.STATE_HEADERS)['Content-Type'] = 'application/json';
    const res = await c.execute('test');
    expect(res.body).toBe('{"error":"bar"}');
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
        this.state.set(Controller.STATE_BODY, {
          foo: 'bar',
        });
      }
    }

    const c = new C({});
    const res = await c.execute('test');
    expect(res.body).toBe('layout'); //render output "layout" text
  });

  test('direct assign view2', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];
      constructor(request) {
        super(request);
        ControllerMixinView.setLayout(this.state, new View('layout', {}), {});
        ControllerMixinView.setTemplate(this.state, {render:()=>'template', data:{}}, {});
        ControllerMixinView.setErrorTemplate(this.state, {render:()=>'error_tpl', data:{}}, {});
      }
      async action_test() {
        this.state.set(Controller.STATE_BODY, {
          foo: 'bar',
        });
      }
    }

    const c = new C({});
    const r = await c.execute('test');
    expect(typeof r.body).toBe('string');
    expect(r.body).toBe('{"main":"template"}');
  });

  test('direct assign view3', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];
      constructor(request) {
        super(request);
        ControllerMixinView.setLayout(this.state, new View('layout', {}), {});
        ControllerMixinView.setTemplate(this.state, {render:()=>this.state.get(Controller.STATE_BODY), data:{}}, {});
        ControllerMixinView.setErrorTemplate(this.state, {render:()=>'error_tpl', data:{}}, {});
      }
      async action_test() {
        this.state.set(Controller.STATE_BODY, {
          foo: 'bar',
        });
      }
    }

    const c = new C({});
    const r = await c.execute('test');
    expect(r.body).toBe('{"main":{"foo":"bar"}}');
  });


  test('direct assign view, without data', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinView];
      constructor(request) {
        super(request);
        ControllerMixinView.setLayout(this.state, new View());
        ControllerMixinView.setTemplate(this.state, {render:()=>'template', data:{}});
        ControllerMixinView.setErrorTemplate(this.state, {render:()=>'error_tpl', data:{}});
      }
      async action_test() {
        this.state.set(Controller.STATE_BODY, {
          foo: 'bar',
        });
      }
    }

    const c = new C({});
    const r = await c.execute('test');
    expect(typeof r.body).toBe('string');
    expect(r.body).toBe('{"main":"template"}');
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
            [ControllerMixinView.VIEW_DEFAULT_DATA, {}]
          ])
        );
      }
      async action_test() {
        this.state.set(Controller.STATE_BODY, {
          foo: 'bar',
        });
      }
    }
    const c = new C({});
    const r = await c.execute('test');
    expect(typeof r.body).toBe('string');
    expect(r.body).toBe('{"base":{"foo":"bar"}}');

  });
});
