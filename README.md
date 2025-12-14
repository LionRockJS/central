# LionRockJS

LionRockJS is a Node.js MVC framework inspired by the Kohana Framework. It features a robust ORM, a flexible View system (compatible with LiquidJS), and a modular architecture.

## Getting Started

Download the starter project from GitHub:
- [LionRockJS Example (Bare Node)](https://github.com/LionRockJS/example/tree/bare-node)

Install dependencies:
```bash
npm install
```

### File Structure

```
 L application
   L classes       # Application logic (Models, Controllers)
   L config        # Configuration files
   L logs          # Application logs
   - bootstrap.js  # Application bootstrap
   - routes.js     # Route definitions

   L modules       # Reusable modules
     L example-module
       L index.js
       L init.js
       L routes.js
       L classes
       L config
       L views
 L views           # View templates

 - main.js         # Entry point
```

## Core Components

### Central

`Central` is the heart of the framework, managing configuration, paths, and initialization.

- **Environment**: Supports `DEV`, `TEST`, `STAGING`, `PRODUCTION`.
- **Configuration**: Loads configs from `application/config` and modules.
- **Modules**: Supports a modular architecture for reusable code.

### ORM (Object Relational Mapping)

The ORM system provides a simple way to interact with databases.

#### Model Definition

Models extend the `Model` class and define their schema and relationships.

```typescript
import { Model } from 'lionrockjs';

export default class User extends Model {
  static tableName = 'users';
  
  static fields = new Map([
    ['username', { type: 'string' }],
    ['email', { type: 'string' }]
  ]);

  static hasMany = [
    ['posts', 'model/Post']
  ];
}
```

#### Static Properties
- `tableName`: The database table name.
- `fields`: Map of field definitions.
- `belongsTo`: Map of parent relationships.
- `hasMany`: Array of child relationships.
- `belongsToMany`: Set of many-to-many relationships.

#### CRUD Operations

The `ORM` class provides static methods for data access:

- `ORM.create(Model, options)`: Create a new model instance.
- `ORM.factory(Model, id, options)`: Load a model by ID.
- `ORM.readAll(Model, options)`: Read all records.
- `ORM.readBy(Model, key, values, options)`: Read records by a specific key.
- `ORM.readWith(Model, criteria, options)`: Read records matching complex criteria.
- `ORM.countAll(Model, options)`: Count all records.
- `ORM.updateAll(Model, kv, columnValues, options)`: Bulk update.
- `ORM.deleteAll(Model, options)`: Delete all records.

### Controller

Controllers handle incoming requests and manage the application flow.

#### Lifecycle
1.  `constructor(request)`
2.  `before()`: Pre-action logic.
3.  `action_xxx()`: The action method corresponding to the route.
4.  `after()`: Post-action logic (e.g., rendering views).

#### Basic Functions
- `redirect(location)`: Redirect to a URL.
- `notFound(msg)`: Send a 404 response.

### Controller Mixins

Mixins allow you to compose controller functionality without deep inheritance chains.

#### Available Mixins
- **ActionLogger**: Logs user actions (create, read, update, delete).
- **Database**: Manages database connections for the controller.
- **View**: Handles view rendering, layouts, and templates.
- **Mime**: Manages Content-Type headers.
- **ViewData**: Helper for passing data to views.

#### Usage

```typescript
import { Controller, ControllerMixinView } from 'lionrockjs';

class MyController extends Controller {
  static mixins = [...Controller.mixins, ControllerMixinView];

  async action_index() {
    this.state.get(ControllerMixinViewState.TEMPLATE).assign({
      message: 'Hello World'
    });
  }
}
```

### View System

The view system supports layouts and templates.

- **Layouts**: The outer shell of the page (header, footer).
- **Templates**: The content specific to the action.
- **JSON Support**: Automatically renders JSON if `Content-Type: application/json` is requested.

### Adapters

LionRockJS supports different runtimes and databases via adapters.

- **Runtime**: Node.js, Bun.
- **Database**: SQLite (better-sqlite3), and others via adapter interface.

## License

MIT
