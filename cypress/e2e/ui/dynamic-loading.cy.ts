import { DynamicLoadingPage, type DynamicLoadingExample } from '../../pages/DynamicLoadingPage';

const examples: Record<DynamicLoadingExample, string> = {
  1: 'element hidden in the DOM',
  2: 'element rendered after loading',
};

// The server delays ~5 s, so these tests are slower and more timing-sensitive than the rest:
// they get a longer retry budget than the global default.
describe(
  'Dynamic loading',
  { tags: ['@ui', '@slow'], retries: { runMode: 3, openMode: 0 } },
  () => {
    (Object.entries(examples) as [string, string][]).forEach(([example, description]) => {
      it(`shows "Hello World!" for an ${description}`, () => {
        const page = new DynamicLoadingPage(Number(example) as DynamicLoadingExample);

        page.visit().start();

        // Wait on the UI state, never on a fixed `cy.wait(ms)`.
        page.loadingIndicator().should('be.visible');
        page.finishText().should('be.visible').and('have.text', 'Hello World!');
        page.loadingIndicator().should('not.be.visible');
      });
    });
  },
);
