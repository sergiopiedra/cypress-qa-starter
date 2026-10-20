import budgets from '../../fixtures/budgets.json';

// Lighthouse attaches to Cypress' own Chrome over the remote debugging port, so this suite
// only runs in Chromium-based browsers launched by Cypress (not Electron, not Firefox).
describe(
  'Lighthouse budgets (desktop)',
  { tags: ['@perf', '@slow'], browser: ['chrome', 'chromium', 'edge'] },
  () => {
    budgets.perfPages.forEach((path) => {
      it(`${path} meets the Lighthouse budget`, () => {
        cy.lighthouse(path, budgets.lighthouse.desktop, 'desktop');
      });
    });
  },
);
