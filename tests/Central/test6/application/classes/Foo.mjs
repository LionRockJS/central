export default class Foo{
    constructor(){
    }

    getFooId(){
      return Foo.id || 0;
    }
}
global.FooID = global.FooID || 0;
global.FooID++;
Foo.id = global.FooID;