import { AddRemoveElementsPage } from '../../pages';

describe('Add/remove elements', { tags: '@ui' }, () => {
  const page = new AddRemoveElementsPage();

  beforeEach(() => {
    page.visit();
  });

  [1, 3, 5].forEach((count) => {
    it(`adds ${count} element(s) and removes them one by one`, () => {
      page.add(count);
      page.deleteButtons().should('have.length', count);

      Cypress._.times(count, (removed) => {
        page.removeFirst();
        page.deleteButtons().should('have.length', count - removed - 1);
      });
    });
  });
});
