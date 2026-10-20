import type { Credentials } from '../../types/domain';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Logs in through the HTTP form endpoint and caches the session cookie with `cy.session`,
       * so the UI login form is exercised once in its own spec and skipped everywhere else.
       * @example cy.loginBySession(users.valid)
       */
      loginBySession(credentials: Credentials): Chainable<void>;
    }
  }
}

Cypress.Commands.add('loginBySession', ({ username, password }: Credentials) => {
  cy.session(
    ['the-internet', username],
    () => {
      cy.request({
        method: 'POST',
        url: '/authenticate',
        form: true,
        body: { username, password },
        log: false,
      });
    },
    {
      // `/secure` answers 200 when authenticated and redirects to `/login` otherwise.
      validate() {
        cy.request({ url: '/secure', followRedirect: false }).its('status').should('eq', 200);
      },
    },
  );
});

export {};
