import statusCodes from '../../fixtures/api/status-codes.json';

// `cy.request` also works against any HTTP endpoint on `baseUrl`, not just JSON APIs.
describe('the-internet status codes', { tags: '@api' }, () => {
  (statusCodes as number[]).forEach((code) => {
    it(`/status_codes/${code} answers ${code}`, () => {
      cy.request({
        url: `/status_codes/${code}`,
        failOnStatusCode: false,
        followRedirect: false,
      })
        .its('status')
        .should('eq', code);
    });
  });
});
