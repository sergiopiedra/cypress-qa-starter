import budgets from '../../fixtures/budgets.json';
import type { WebVitals } from '../../support/commands/perf';

const metrics = Object.keys(budgets.webVitals) as (keyof WebVitals)[];

// Field-style Core Web Vitals measured in the test browser. Cheap enough to run on every PR;
// Lighthouse gives the deeper lab audit. Metrics a browser cannot measure are skipped, not failed.
describe('Core Web Vitals budgets', { tags: '@perf' }, () => {
  budgets.perfPages.forEach((path) => {
    it(`${path} is within the Core Web Vitals budget`, () => {
      cy.visitWithWebVitals(path);

      cy.getWebVitals().then((vitals) => {
        cy.addTestContext({ title: 'Core Web Vitals', value: vitals });

        metrics.forEach((metric) => {
          const value = vitals[metric];
          if (value === undefined) {
            cy.log(`${metric.toUpperCase()} not supported in ${Cypress.browser.displayName}`);
            return;
          }
          expect(value, metric.toUpperCase()).to.be.at.most(budgets.webVitals[metric]);
        });
      });
    });
  });
});
