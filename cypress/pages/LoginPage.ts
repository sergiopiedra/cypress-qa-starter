import type { Credentials } from '../types/domain';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  protected readonly path = '/login';

  private readonly selectors = {
    username: '#username',
    password: '#password',
    submit: '#login button[type="submit"]',
  } as const;

  usernameInput(): Cypress.Chainable<JQuery<HTMLInputElement>> {
    return cy.get<HTMLInputElement>(this.selectors.username);
  }

  passwordInput(): Cypress.Chainable<JQuery<HTMLInputElement>> {
    return cy.get<HTMLInputElement>(this.selectors.password);
  }

  submitButton(): Cypress.Chainable<JQuery<HTMLButtonElement>> {
    return cy.get<HTMLButtonElement>(this.selectors.submit);
  }

  /** Fills the form and submits it. Empty values are left blank (`cy.type('')` would throw). */
  loginAs({ username, password }: Credentials): this {
    if (username) this.usernameInput().type(username);
    if (password) this.passwordInput().type(password, { log: false });
    this.submitButton().click();
    return this;
  }
}
