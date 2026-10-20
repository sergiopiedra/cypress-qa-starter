declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * `cy.request` against the reqres API: prefixes `Cypress.expose('apiUrl')`, sends JSON and
       * adds the `x-api-key` header from the `reqresApiKey` secret (read with `cy.env`, so it is
       * never exposed to the browser bundle).
       * @example cy.apiRequest<ListResponse<User>>({ url: '/users', qs: { page: 2 } })
       */
      apiRequest<T = unknown>(
        options: Partial<RequestOptions> & { url: string },
      ): Chainable<Response<T>>;
    }
  }
}

Cypress.Commands.add(
  'apiRequest',
  <T>(options: Partial<Cypress.RequestOptions> & { url: string }) => {
    const apiUrl = String(Cypress.expose('apiUrl'));

    return cy
      .env<{ reqresApiKey?: string }>(['reqresApiKey'], { log: false })
      .then(({ reqresApiKey }) =>
        cy.request<T>({
          ...options,
          url: `${apiUrl}${options.url}`,
          headers: {
            'Content-Type': 'application/json',
            ...(reqresApiKey ? { 'x-api-key': reqresApiKey } : {}),
            ...options.headers,
          },
        }),
      );
  },
);

export {};
