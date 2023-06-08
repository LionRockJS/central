# LionRockJS
Node.js MVC structure base on Kohana Framework, 
With ORM using better-sqlite3
View with LiquidJS

### Getting started


The file structure
```
 L application
   L classes
   L config
   L logs
   - bootstrap.js
   - routes.js

   L modules
     L example-module
       L index.js
       L init.js
       L routes.js
       L classes
       L config
       L views
 L views

 - main.js
```

## Bootstrap
module.exports = {
};

## ORM
ORM provide following static variables:

- ORM.tableName
  - table name of the class
- ORM.jointTablePrefix
- ORM.belongsTo
  - list of the class belongs
- ORM.hasMany 
- ORM.belongsToMany


## Controller
Controller provide basic flow of execution.
1. constructor
2. before
3. action_xxx
4. after

it also provide basic function
1. redirect(location);
2. notFound(msg);

default action:
1. action_index

## Controller Mixin
We can use extends to provide addition features to controller, but it will increase complexity and unused functions to child classes.

Controller Mixin introduced to prevent problems create by extends.

```
//sample controller mixin
class SampleMixin extends ControllerMixin{
static mixins = [...ControllerMixin.mixins, SampleMixin];

//client is a controller
constructor(client)

//add function on before
async before()
async after()

//manually called by client controller
action_index()
action_something()

//additional functions
getView(path, data)
moreFunctions(arg)

}
```
sample code to add mixin in controller

```

class ControllerView extends Controller{
  static mixins = [...Controller.mixins, ControllerMixinView];

  constructor(request){
    super(request);
  }
  
  action_index(){

  }
}

```