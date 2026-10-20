import { BasePage } from './BasePage';

export type JsDialog = 'Alert' | 'Confirm' | 'Prompt';

export class JavaScriptAlertsPage extends BasePage {
  protected readonly path = '/javascript_alerts';

  trigger(dialog: JsDialog): this {
    cy.contains('button', `Click for JS ${dialog}`).click();
    return this;
  }

  result(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('#result');
  }
}
