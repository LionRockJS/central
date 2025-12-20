# Central Module Loading

Central supports loading external npm modules as plugins. This allows extending the application with additional functionality, configurations, and views.

## Workflow

1.  **Create an npm module** (or a local module).
2.  **Export module metadata** in the module's entry point (e.g., `index.js`).
3.  **Register the module** in the application using `Central.addModules`.

## Module Structure

The module must export an object containing:
-   `filename`: The URL of the current file (`import.meta.url`). This is used to resolve paths relative to the module.
-   `configs`: An optional array of configuration names to load.

### Example Module (`index.js`)

```javascript
export default {
  filename: import.meta.url,
  configs: ['admin', 'edm', 'xxx']
}
```

In this example, Central will look for configuration files in the `config/` directory of the module:
-   `config/admin.mjs`
-   `config/edm.mjs`
-   `config/xxx.mjs`

These configurations will be merged into `Central.config`.

## Registering Modules

In the application's entry point (e.g., `application/import.mjs` or during initialization), use `Central.addModules` to register the modules.

### Example Registration

```javascript
import Central from '@lionrockjs/central';

// ... inside an async function
await Central.addModules([
  await import('@lionrockjs/adapter-view-liquidjs'),
  // other modules...
]);
```

## How it works

1.  `Central.addModules` calls `HelperPath.addModules` to add the module's directory to the list of node packages. This allows `Central.resolve` to find files within the module.
2.  It iterates through the provided modules.
3.  For each module, if `configs` are specified, it loads the corresponding configuration files from the module's `config/` directory.
4.  The loaded configurations are merged into the global `Central.config` using `HelperConfig.addConfig`.
5.  Finally, `Central.applyApplicationConfigs` is called to ensure application-level overrides are applied.
