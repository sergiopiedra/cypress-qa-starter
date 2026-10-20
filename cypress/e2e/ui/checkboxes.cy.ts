import { CheckboxesPage } from '../../pages';

describe('Checkboxes', { tags: '@ui' }, () => {
  const page = new CheckboxesPage();

  beforeEach(() => {
    page.visit();
  });

  it('renders with the expected default state', { tags: '@smoke' }, () => {
    page.checkboxes().should('have.length', 2);
    page.checkbox(0).should('not.be.checked');
    page.checkbox(1).should('be.checked');
  });

  it('checks and unchecks each box independently', () => {
    page.checkbox(0).check();
    page.checkbox(1).uncheck();

    page.checkbox(0).should('be.checked');
    page.checkbox(1).should('not.be.checked');
  });
});
