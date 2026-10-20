/**
 * Base class for every Page Object.
 *
 * Page Objects own selectors and page-level actions. They never assert business outcomes:
 * they return Cypress chainables so the spec decides what to expect.
 */
export abstract class BasePage {
  /** Path relative to `baseUrl`. */
  protected abstract readonly path: string;

  visit(options?: Partial<Cypress.VisitOptions>): this {
    cy.visit(this.path, options);
    return this;
  }

  /** Main heading of the example area (the-internet uses h2 or h3 depending on the page). */
  heading(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('#content').find('h2, h3').first();
  }

  /** Flash banner shown after form submissions. */
  flash(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get('#flash');
  }
}
