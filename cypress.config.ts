import { defineConfig } from 'cypress';

// Cypress 13 replaced the old cypress.json (+ cypress/plugins) with this file.
// Settings migrated 1:1 from the former cypress.json, keeping the existing
// pre-v10 folder layout (specs under cypress/integration, support/index.js).
export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:4200',
        specPattern: 'cypress/integration/**/*.spec.ts',
        supportFile: 'cypress/support/index.js',
        video: false,
        // Former cypress/plugins/index.js was a no-op.
        setupNodeEvents(_on, config) {
            return config;
        }
    },
    reporter: 'cypress-multi-reporters',
    reporterOptions: {
        configFile: 'cypress/reporter-config.json'
    },
    env: {
        NODE_OPTIONS: '--max_old_space_size="2000000"'
    }
});
