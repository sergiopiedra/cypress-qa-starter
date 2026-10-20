import { JavaScriptAlertsPage } from '../../pages';

describe('JavaScript dialogs', { tags: '@ui' }, () => {
  const page = new JavaScriptAlertsPage();

  beforeEach(() => {
    page.visit();
  });

  it('acknowledges an alert', () => {
    const onAlert = cy.stub().as('alert');
    cy.on('window:alert', onAlert);

    page.trigger('Alert');

    cy.get('@alert').should('have.been.calledOnceWith', 'I am a JS Alert');
    page.result().should('have.text', 'You successfully clicked an alert');
  });

  [
    { accept: true, result: 'You clicked: Ok' },
    { accept: false, result: 'You clicked: Cancel' },
  ].forEach(({ accept, result }) => {
    it(`${accept ? 'accepts' : 'dismisses'} a confirm`, () => {
      cy.on('window:confirm', (text) => {
        expect(text).to.equal('I am a JS Confirm');
        return accept;
      });

      page.trigger('Confirm');

      page.result().should('have.text', result);
    });
  });

  it('answers a prompt', () => {
    cy.window().then((win) => {
      cy.stub(win, 'prompt').as('prompt').returns('Cypress');
    });

    page.trigger('Prompt');

    cy.get('@prompt').should('have.been.calledOnceWith', 'I am a JS prompt');
    page.result().should('have.text', 'You entered: Cypress');
  });
});
