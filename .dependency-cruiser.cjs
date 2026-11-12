// Module dependency rules for the Angular modules under src/app.
//
// Layers, from the bottom up. A module may only import from layers below it:
//
//   shared   reusable building blocks, imports no other app module
//   grid     reusable data grid, may use shared
//   core     app-wide singletons (services, models, state), may use shared
//   features main, content, user, orders, samples: may use core, shared
//            and grid, never each other
//   app      the root (app.module.ts, routing), may use everything
//
// Run with `npm run lint:deps`. Violations that existed when the rules were
// introduced are listed in .dependency-cruiser-known-violations.json and only
// new ones fail. After fixing a known violation, run `npm run lint:deps:baseline`
// so it cannot come back.

const FEATURES = '(main|content|user|orders|samples)';

/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'shared-is-standalone',
            comment:
                'shared is the bottom layer: it must not import any other app module. ' +
                'Move the needed code into shared, or the shared code up into the module that uses it.',
            severity: 'error',
            from: { path: '^src/app/shared/' },
            to: { path: '^src/app/', pathNot: '^src/app/shared/' }
        },
        {
            name: 'grid-only-uses-shared',
            comment:
                'grid is a reusable component: it may only import from shared. ' +
                'Pass feature data in through inputs and grid-owned models instead.',
            severity: 'error',
            from: { path: '^src/app/grid/' },
            to: { path: '^src/app/', pathNot: '^src/app/(grid|shared)/' }
        },
        {
            name: 'core-only-uses-shared',
            comment:
                'core holds app-wide singletons: it may only import from shared. ' +
                'A feature that core needs belongs in core, or the feature should depend on core instead.',
            severity: 'error',
            from: { path: '^src/app/core/' },
            to: { path: '^src/app/', pathNot: '^src/app/(core|shared)/' }
        },
        {
            name: 'no-feature-to-feature',
            comment:
                'Feature modules must not import each other. ' +
                'Move what both need into core or shared, or talk through the store.',
            severity: 'error',
            from: { path: `^src/app/${FEATURES}/` },
            to: { path: `^src/app/${FEATURES}/`, pathNot: '^src/app/$1/' }
        },
        {
            name: 'no-import-of-app-root',
            comment: 'Only main.ts may import the app root (app.module, app.component, app-routing.module).',
            severity: 'error',
            from: { path: '^src/app/[^/]+/' },
            to: { path: '^src/app/[^/]+\\.ts$' }
        },
        {
            name: 'no-circular',
            comment:
                'This import closes a cycle. Cycles make load order fragile and can leave a ' +
                'value undefined at runtime. Cycles made only of type imports are left out, ' +
                'since those are erased at compile time.',
            severity: 'warn',
            from: {},
            to: {
                circular: true,
                viaOnly: { dependencyTypesNot: ['type-only'] }
            }
        }
    ],
    options: {
        includeOnly: '^src/',
        doNotFollow: { path: 'node_modules' },
        // Type-only imports couple modules too, so they count.
        tsPreCompilationDeps: true,
        tsConfig: { fileName: 'tsconfig.json' },
        enhancedResolveOptions: {
            exportsFields: ['exports'],
            conditionNames: ['import', 'require', 'node', 'default', 'types'],
            mainFields: ['module', 'main', 'types', 'typings']
        }
    }
};
