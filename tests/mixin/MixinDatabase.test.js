import { Controller } from '@lionrockjs/mvc';
import ControllerMixinDatabase from '../../classes/controller-mixin/Database.mjs';

describe('test mixin database', () => {
  test('test add mixin', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinDatabase];

      constructor(request) {
        super(request);
        this.state.get(ControllerMixinDatabase.DATABASE_MAP).set('session', '');
      }
    }

    const c = new C({});
    await c.execute(null, true);
    expect(c.state.get('databases').get('session')).not.toBe(null);
  });

  test('test append', async () => {
    class C extends Controller {
      static mixins = [ControllerMixinDatabase];
      constructor(request) {
        super(request);
        this.state.get(ControllerMixinDatabase.DATABASE_MAP).set('session', '');
      }
    }

    class D extends C {
      constructor(request) {
        super(request);
        this.state.get(ControllerMixinDatabase.DATABASE_MAP).set('foo', '');
      }
    }

    const d = new D({});
    await d.execute(null, true);

    expect(Array.from(d.state.get('databases').keys()).join(',')).toBe('session,foo,createdAt');
  });

  test('test database get connection error', async () => {
    //TODO: test database get connection error
  })
});
