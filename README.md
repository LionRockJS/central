# LionRockJS

LionRockJS is a Node.js MVC framework inspired by the Kohana Framework. It features a robust ORM, a flexible View system (compatible with LiquidJS), and a modular architecture.

## Features

### Core Architecture
- **MVC Pattern**: Strict separation of Model, View, and Controller.
- **Modular Design**: extensible architecture allowing code reuse across projects via modules.
- **Multi-Runtime Support**: Designed to run seamlessly on **Node.js** and **Bun**.
- **TypeScript**: Built with TypeScript for type safety and modern JavaScript features.
- **Environment Management**: Built-in support for `DEV`, `TEST`, `STAGING`, and `PRODUCTION` environments.

### Configuration & System
- **Cascading Configuration**: Merges configs from system, modules, and application levels.
- **Smart Caching**:
  - Class path caching for faster resolution.
  - View path caching.
  - Hot-reload capabilities via cache clearing.
- **Path Management**: Centralized handling of execution, application, and view paths.

### ORM (Object Relational Mapping)
- **Active Record Implementation**: Intuitive data access patterns.
- **Relationships**:
  - One-to-One (`belongsTo`)
  - One-to-Many (`hasMany`)
  - Many-to-Many (`belongsToMany`)
- **Advanced Querying**:
  - `readBy` / `countBy`: Simple key-value lookups.
  - `readWith` / `countWith`: Complex criteria-based queries.
  - `updateAll` / `deleteAll`: Batch operations.
- **Database Agnostic**: Abstract adapter layer allowing support for various SQL databases.

### Controller System
- **Lifecycle Hooks**: `before()` and `after()` hooks for request processing.
- **Mixin Architecture**: Composition over inheritance using mixins:
  - **ActionLogger**: 
    - Automatically logs critical actions (create, read, update, delete, import, export).
    - Rotates logs by date (YYYY/MM/DD).
    - Captures user context, IP, and request parameters.
  - **Database**: 
    - Manages multiple database connections.
    - Connection pooling/caching based on configuration hash.
    - Supports dependency injection for database adapters.
  - **View**: 
    - Manages the rendering pipeline (Layouts -> Templates).
    - Supports "Placeholders" for dynamic content injection.
    - Handles error templates and default view data.
  - **Mime**: 
    - Automatic `Content-Type` detection based on file extension/URL.
    - Defaults to `text/html; charset=utf-8`.
  - **ViewData**: 
    - Automatically injects global context into views.
    - Exposes `request` object (host, locale, path, query, cookies).
- **State Management**: Centralized `ControllerState` for request/response context.

### View Engine
- **Layouts & Templates**: Support for nested layouts and reusable templates.
- **Content Negotiation**: Automatic JSON rendering for API requests (`application/json`).
- **LiquidJS Support**: Compatible with LiquidJS for logic-less templates.

### Security & Helpers
- **Crypto Helper**:
  - Web Crypto API integration (`node:crypto`).
  - Key generation (HMAC, RSA, ECDSA).
  - Data signing and verification.
- **Utilities**: Built-in helpers for path resolution, bootstrapping, and configuration.

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
