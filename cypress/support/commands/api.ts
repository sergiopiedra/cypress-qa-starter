declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * `cy.request` against the reqres API: prefixes `Cypress.expose('apiUrl')`, sends JSON and
       * adds the `x-api-key` header from the `reqresApiKey` secret (read with `cy.env`, so it is
       * never exposed to the browser bundle). A rate-limited response (HTTP 429) fails with an
       * actionable message instead of a generic status error.
       * @example cy.apiRequest<ListResponse<User>>({ url: '/users', qs: { page: 2 } })
       */
      apiRequest<T = unknown>(
        options: Partial<RequestOptions> & { url: string },
      ): Chainable<Response<T>>;
    }
  }
}

const RATE_LIMIT_HELP =
  'reqres rate limit reached (HTTP 429). Anonymous use is capped per IP per day. ' +
  'Create a free account at https://app.reqres.in and set its key as CYPRESS_reqresApiKey ' +
  '(locally or in cypress.env.json) or as the REQRES_API_KEY secret in GitHub Actions.';

Cypress.Commands.add(
  'apiRequest',
  <T>({
    failOnStatusCode = true,
    ...options
  }: Partial<Cypress.RequestOptions> & { url: string }) => {
    const url = `${String(Cypress.expose('apiUrl'))}${options.url}`;

    return cy
      .env<{ reqresApiKey?: string }>(['reqresApiKey'], { log: false })
      .then(({ reqresApiKey }) =>
        cy.request<T>({
          ...options,
          url,
          // Status handling happens below, so a 429 can be reported with a useful message.
          failOnStatusCode: false,
          headers: {
            'Content-Type': 'application/json',
            ...(reqresApiKey ? { 'x-api-key': reqresApiKey } : {}),
            ...options.headers,
          },
        }),
      )
      .then((response) => {
        if (response.status === 429) throw new Error(RATE_LIMIT_HELP);
        if (failOnStatusCode && response.status >= 400) {
          throw new Error(
            `${options.method ?? 'GET'} ${url} answered ${response.status}: ${JSON.stringify(response.body)}`,
          );
        }
        return response;
      });
  },
);

export {};
