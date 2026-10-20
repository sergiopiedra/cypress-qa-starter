import users from '../../fixtures/users.json';
import { LoginPage, TablesPage } from '../../pages';

// Every page the UI suite touches gets a WCAG 2.1 AA scan.
const pages = [
  '/login',
  '/checkboxes',
  '/dropdown',
  '/tables',
  '/javascript_alerts',
  '/add_remove_elements/',
  '/dynamic_loading/1',
];

describe('Accessibility (WCAG 2.1 AA)', { tags: '@a11y' }, () => {
  pages.forEach((path) => {
    it(`${path} has no blocking violations`, () => {
      cy.visit(path);
      cy.checkAccessibility();
    });
  });

  // Scan states that only exist after interaction, not just the initial render.
  it('login error state has no blocking violations', () => {
    const loginPage = new LoginPage();

    loginPage.visit().loginAs({ ...users.valid, password: 'wrong' });
    loginPage.flash().should('be.visible');

    cy.checkAccessibility();
  });

  it('secure area has no blocking violations', () => {
    cy.loginBySession(users.valid);
    cy.visit('/secure');

    cy.checkAccessibility();
  });

  it('sorted table region has no blocking violations', () => {
    const tablesPage = new TablesPage();

    tablesPage.visit().sortBy('Due');

    cy.checkAccessibility({ context: '#table1' });
  });
});
