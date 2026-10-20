import { BasePage } from './BasePage';

export class DropdownPage extends BasePage {
  protected readonly path = '/dropdown';

  select(): Cypress.Chainable<JQuery<HTMLSelectElement>> {
    return cy.get<HTMLSelectElement>('#dropdown');
  }

  selectedOption(): Cypress.Chainable<JQuery<HTMLOptionElement>> {
    return cy.get<HTMLOptionElement>('#dropdown option:selected');
  }

  choose(label: string): this {
    this.select().select(label);
    return this;
  }
}
