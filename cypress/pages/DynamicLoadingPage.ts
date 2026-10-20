import { BasePage } from './BasePage';

export type DynamicLoadingExample = 1 | 2;

/**
 * Example 1 reveals an element that is already in the DOM but hidden.
 * Example 2 inserts the element into the DOM only after loading finishes.
 */
export class DynamicLoadingPage extends BasePage {
  protected readonly path: string;

  constructor(readonly example: DynamicLoadingExample) {
    super();
    this.path = `/dynamic_loading/${example}`;
  }

  startButton(): Cypress.Chainable<JQuery<HTMLButtonElement>> {
    return cy.get<HTMLButtonElement>('#start button');
  }

  loadingIndicator(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('#loading');
  }

  /** The result appears ~5 s after start, so allow a longer timeout instead of a hard wait. */
  finishText(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('#finish h4', { timeout: 15000 });
  }

  start(): this {
    this.startButton().click();
    return this;
  }
}
