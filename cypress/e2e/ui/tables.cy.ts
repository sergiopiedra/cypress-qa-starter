import expectedUsers from '../../fixtures/table-users.json';
import { TablesPage } from '../../pages';
import type { TableUser } from '../../types/domain';

const toAmount = (due: string): number => Number(due.replace(/[^0-9.]/g, ''));

describe('Sortable data tables', { tags: '@ui' }, () => {
  const page = new TablesPage();

  beforeEach(() => {
    page.visit();
  });

  it('lists every user from the fixture', () => {
    page.rows().should('deep.equal', expectedUsers as TableUser[]);
  });

  it('sorts by last name ascending', () => {
    page.sortBy('Last Name');

    page.rows().then((rows) => {
      const lastNames = rows.map((row) => row.lastName);
      expect(lastNames).to.deep.equal([...lastNames].sort());
    });
  });

  it('sorts by amount due as a number, not as text', () => {
    page.sortBy('Due');

    page.rows().then((rows) => {
      const amounts = rows.map((row) => toAmount(row.due));
      expect(amounts).to.deep.equal([...amounts].sort((a, b) => a - b));
    });
  });
});
