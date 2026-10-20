import { BasePage } from './BasePage';

export class SecureAreaPage extends BasePage {
  protected readonly path = '/secure';

  logoutButton(): Cypress.Chainable<JQuery<HTMLAnchorElement>> {
    return cy.get<HTMLAnchorElement>('a[href="/logout"]');
  }

  logout(): this {
    this.logoutButton().click();
    return this;
  }
}
