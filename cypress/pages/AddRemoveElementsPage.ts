import { BasePage } from './BasePage';

export class AddRemoveElementsPage extends BasePage {
  protected readonly path = '/add_remove_elements/';

  addButton(): Cypress.Chainable<JQuery<HTMLButtonElement>> {
    return cy.contains<HTMLButtonElement>('button', 'Add Element');
  }

  deleteButtons(): Cypress.Chainable<JQuery<HTMLButtonElement>> {
    return cy.get<HTMLButtonElement>('#elements button.added-manually');
  }

  add(times: number): this {
    Cypress._.times(times, () => this.addButton().click());
    return this;
  }

  removeFirst(): this {
    this.deleteButtons().first().click();
    return this;
  }
}
