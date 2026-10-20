import { BasePage } from './BasePage';

export class CheckboxesPage extends BasePage {
  protected readonly path = '/checkboxes';

  checkboxes(): Cypress.Chainable<JQuery<HTMLInputElement>> {
    return cy.get<HTMLInputElement>('#checkboxes input[type="checkbox"]');
  }

  /** Zero-based index, in document order. */
  checkbox(index: number): Cypress.Chainable<JQuery<HTMLInputElement>> {
    return this.checkboxes().eq(index);
  }
}
