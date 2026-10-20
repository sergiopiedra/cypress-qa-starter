import scenarios from '../../fixtures/login-scenarios.json';
import users from '../../fixtures/users.json';
import { LoginPage, SecureAreaPage } from '../../pages';
import type { LoginScenario } from '../../types/domain';

const loginScenarios = scenarios as LoginScenario[];

describe('Login', { tags: ['@ui', '@auth'] }, () => {
  const loginPage = new LoginPage();
  const secureArea = new SecureAreaPage();

  beforeEach(() => {
    loginPage.visit();
  });

  // Data-driven: one test per fixture row. Importing the JSON (instead of `cy.fixture`)
  // makes the data available while Mocha is still registering tests.
  loginScenarios.forEach(({ title, outcome, message, tags = [], ...credentials }) => {
    it(`shows "${message}" for ${title}`, { tags }, () => {
      loginPage.loginAs(credentials);

      loginPage.flash().should('have.class', outcome).and('contain.text', message);
      cy.location('pathname').should('eq', outcome === 'success' ? '/secure' : '/login');
    });
  });

  it('logs out from the secure area', { tags: '@smoke' }, () => {
    loginPage.loginAs(users.valid);
    secureArea.logout();

    cy.location('pathname').should('eq', '/login');
    loginPage.flash().should('contain.text', 'You logged out of the secure area!');
  });
});

describe('Secure area', { tags: ['@ui', '@auth'] }, () => {
  const secureArea = new SecureAreaPage();

  it('is reachable with a cached session (cy.session)', () => {
    cy.loginBySession(users.valid);
    secureArea.visit();

    secureArea.heading().should('contain.text', 'Secure Area');
    secureArea.logoutButton().should('be.visible');
  });

  it('redirects anonymous visitors to the login page', () => {
    secureArea.visit();

    cy.location('pathname').should('eq', '/login');
  });
});
