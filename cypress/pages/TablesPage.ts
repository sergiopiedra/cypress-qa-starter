import type { TableUser } from '../types/domain';
import { BasePage } from './BasePage';

export type TableColumn = 'Last Name' | 'First Name' | 'Email' | 'Due' | 'Web Site';

export class TablesPage extends BasePage {
  protected readonly path = '/tables';

  private readonly table = '#table1';

  header(column: TableColumn): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.contains(`${this.table} thead th`, column);
  }

  sortBy(column: TableColumn): this {
    this.header(column).click();
    return this;
  }

  /** Reads the table body into typed rows, in the order currently displayed. */
  rows(): Cypress.Chainable<TableUser[]> {
    return cy.get(`${this.table} tbody tr`).then(($rows) =>
      Cypress._.map($rows, (row) => {
        const [lastName, firstName, email, due, website] = Cypress._.map(
          row.querySelectorAll('td'),
          (cell) => cell.textContent?.trim() ?? '',
        );
        return {
          lastName: lastName ?? '',
          firstName: firstName ?? '',
          email: email ?? '',
          due: due ?? '',
          website: website ?? '',
        };
      }),
    );
  }
}
