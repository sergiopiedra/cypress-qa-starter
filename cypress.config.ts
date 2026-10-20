import { plugin as cypressGrepPlugin } from '@cypress/grep/plugin';
import { defineConfig } from 'cypress';
import registerMochawesome from 'cypress-mochawesome-reporter/plugin';
import cypressOnFix from 'cypress-on-fix';

import { registerLighthouse } from './cypress/plugins/lighthouse';

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports/html',
    reportPageTitle: 'cypress-qa-starter',
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    saveJson: true,
  },

  // Retry failed tests in `cypress run` only; a test that passes on retry is reported as flaky.
  retries: { runMode: 2, openMode: 0 },

  viewportWidth: 1280,
  viewportHeight: 800,
  defaultCommandTimeout: 8000,
  requestTimeout: 15000,
  video: false,
  screenshotOnRunFailure: true,

  // Secrets: read in specs with `cy.env(['key'])`. Override with `cypress.env.json` (git-ignored)
  // or a `CYPRESS_reqresApiKey` environment variable. The default is reqres' public free-tier key.
  env: {
    reqresApiKey: 'reqres-free-v1',
  },

  // Public, non-secret values: read in specs with `Cypress.expose('key')`.
  // Override from the CLI with `--expose key=value`.
  expose: {
    apiUrl: 'https://reqres.in/api',
    // Quarantined tests are excluded from every run unless a run asks for them explicitly.
    grepTags: '-@quarantine',
    grepFilterSpecs: true,
    grepOmitFiltered: true,
  },

  e2e: {
    baseUrl: 'https://the-internet.herokuapp.com',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    setupNodeEvents(cypressOn, config) {
      // Lets several plugins subscribe to the same event (e.g. `after:run`) without overwriting each other.
      const on = cypressOnFix(cypressOn);

      registerMochawesome(on);
      cypressGrepPlugin(config);
      registerLighthouse(on);

      on('task', {
        log(message: unknown) {
          console.log(message);
          return null;
        },
        table(rows: Record<string, unknown>[]) {
          console.table(rows);
          return null;
        },
      });

      return config;
    },
  },
});
