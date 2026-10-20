import options from '../../fixtures/dropdown-options.json';
import { DropdownPage } from '../../pages';
import type { DropdownOption } from '../../types/domain';

describe('Dropdown', { tags: '@ui' }, () => {
  const page = new DropdownPage();

  beforeEach(() => {
    page.visit();
  });

  it('starts on a disabled placeholder', () => {
    page.selectedOption().should('have.text', 'Please select an option').and('be.disabled');
  });

  (options as DropdownOption[]).forEach(({ label, value }) => {
    it(`selects "${label}"`, () => {
      page.choose(label);

      page.select().should('have.value', value);
      page.selectedOption().should('have.text', label);
    });
  });
});
