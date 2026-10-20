import { BasePage } from './BasePage';

/** Menu items are rendered at random on each load: a real-world source of flakiness. */
export class DisappearingElementsPage extends BasePage {
  protected readonly path = '/disappearing_elements';

  menuItems(): Cypress.Chainable<JQuery<HTMLAnchorElement>> {
    return cy.get<HTMLAnchorElement>('#content ul li a');
  }
}
