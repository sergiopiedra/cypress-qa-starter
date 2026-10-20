# Copilot instructions — cypress-qa-starter

Cypress 16 + TypeScript (strict) test suite for two public targets:

- UI: <https://the-internet.herokuapp.com> (`baseUrl`)
- API: <https://reqres.in/api> (`Cypress.expose('apiUrl')`)

Follow these conventions for every change. When a rule conflicts with a quick fix, the rule wins.

## Where things live

| Path                              | Purpose                                                                                 |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| `cypress/e2e/{ui,api,a11y,perf}/` | Specs, one folder per test type. Files are `kebab-case.cy.ts`.                          |
| `cypress/pages/`                  | Page Objects (`PascalCasePage.ts`), all extending `BasePage`, exported from `index.ts`. |
| `cypress/api/`                    | `ReqresClient` (API object model) and response types in `types.ts`.                     |
| `cypress/support/commands/`       | Custom commands, one file per domain (`auth`, `api`, `a11y`, `perf`).                   |
| `cypress/plugins/`                | Node-side code registered in `setupNodeEvents` (Lighthouse, flaky reporter).            |
| `cypress/fixtures/`               | Test data, budgets and policies (JSON).                                                 |
| `cypress/types/domain.ts`         | Types for fixture data.                                                                 |
| `scripts/`                        | Node scripts run outside Cypress (`.mts`, executed with plain `node`).                  |

## Page Objects

- Extend `BasePage` and set `protected readonly path`.
- Keep selectors inside the class (a private `selectors` object or the element getter). Specs never contain raw selectors for elements that have a Page Object.
- Element getters return `Cypress.Chainable<JQuery<...>>` with the precise element type.
- Action methods return `this` so they chain: `loginPage.visit().loginAs(user)`.
- **No assertions in Page Objects.** They return chainables; specs decide what to expect.
- Selector priority: `data-cy` / `data-testid` (when you control the app) → `id` → `cy.contains(selector, text)` → stable CSS. Never XPath (lint error).

## Custom commands

- One file per domain in `cypress/support/commands/`, imported from `cypress/support/e2e.ts`.
- Declare the type in the same file with `declare global { namespace Cypress { interface Chainable { ... } } }`, with JSDoc and an `@example`.
- Add a command only for cross-cutting behaviour (session login, API auth, a11y, perf). Page-specific actions belong in Page Objects.
- Log secrets with `{ log: false }`.

## Configuration and secrets (Cypress 16)

- `Cypress.env()` no longer exists. Use:
  - `Cypress.expose('key')` for public values (set in `expose` in `cypress.config.ts` or `--expose key=value`).
  - `cy.env(['key'])` for secrets (set in `env`, `cypress.env.json` or `CYPRESS_<key>`).
- Never hard-code URLs in specs. Use relative paths for the UI and `cy.apiRequest` / `ReqresClient` for the API.
- Never commit secrets. `cypress.env.json` is git-ignored; `cypress.env.example.json` documents the keys.

## Data-driven tests

- Import JSON fixtures at the top of the spec and cast them to a type from `cypress/types/domain.ts` (or `cypress/api/types.ts`). Import (not `cy.fixture`) because tests must be generated while Mocha registers them:

  ```ts
  import scenarios from '../../fixtures/login-scenarios.json';
  const loginScenarios = scenarios as LoginScenario[];
  loginScenarios.forEach(({ title, ...data }) => it(`… ${title}`, () => { … }));
  ```

- Each fixture row produces one test with a unique, descriptive title.
- Make data unique when tests create records (`Date.now()` suffix) so parallel shards never collide.

## API tests

- Go through `ReqresClient` (`cypress/api/ReqresClient.ts`). New endpoint means a new typed method plus its response type in `cypress/api/types.ts`.
- Assert status, body shape/values and, for read endpoints, `duration` against `fixtures/budgets.json`.
- Pass `failOnStatusCode: false` (in the client) only for endpoints whose error responses are under test.
- reqres limits anonymous traffic per IP per day; keep API specs lean and don't loop requests.

## Tags

Every `describe` has exactly one type tag and optional extra tags:

| Tag                          | Meaning                                                      |
| ---------------------------- | ------------------------------------------------------------ |
| `@ui` `@api` `@a11y` `@perf` | Test type (required, matches the folder).                    |
| `@smoke`                     | Critical path; must stay fast and run on every change.       |
| `@auth`                      | Touches authentication.                                      |
| `@slow`                      | Takes more than ~5 s.                                        |
| `@quarantine`                | Known flaky. Excluded from the blocking pipeline. See below. |

## Flaky-test policy

- Never use `cy.wait(<ms>)`. Wait on application state (`should`, longer `timeout` on the specific query, `cy.intercept` + `cy.wait('@alias')`).
- Never use `{ force: true }`, `.only`, `cy.pause()` or `cy.debug()` (lint errors).
- Global retries are `runMode: 2`. Raise them per suite only with a comment explaining why (see `dynamic-loading.cy.ts`).
- A test that passes on retry is flaky, not green: it shows up in the flaky report and CI summary. Fix it, or quarantine it:
  1. Add `{ tags: '@quarantine' }` to the test.
  2. Add a comment explaining the cause and linking the tracking issue.
  3. Remove the tag once fixed. Quarantine is temporary.
- Tests are isolated (`testIsolation` is on). Each test creates its own state; use `cy.loginBySession()` rather than logging in through the UI, except in the login spec itself.

## Accessibility

- After `cy.visit()` and after meaningful state changes (errors, modals, sorted data), call `cy.checkAccessibility()`.
- Policy (WCAG 2.1 A/AA, fails on critical/serious) lives in `fixtures/a11y-policy.json`.
- Never disable axe rules inline. Add known issues to the policy `baseline` with the page path, rule id and a reason.

## Performance

- Budgets live in `fixtures/budgets.json`. Don't loosen a budget to make a test pass without explaining why in the PR.
- `cy.lighthouse()` works only in Chromium browsers launched by Cypress (Chrome, Chromium, Edge). Restrict suites with `{ browser: ['chrome', 'chromium', 'edge'] }`.
- Use `cy.visitWithWebVitals()` + `cy.getWebVitals()` for LCP/FCP/CLS. Don't measure TTFB in the browser (Cypress proxies `cy.visit`); use Lighthouse's `server-response-time`.

## Style

- TypeScript strict; no `any` (use `unknown` and narrow). Use `import type` for types.
- Test titles describe behaviour: `shows "<message>" for <case>`, `sorts by amount due as a number`.
- Arrange / act / assert, separated by blank lines.
- Before committing: `npm run check` (typecheck, ESLint, Prettier) must pass.
