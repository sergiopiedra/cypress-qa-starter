import type { ElementContext, ImpactValue, Result } from 'axe-core';
import 'cypress-axe';

import policy from '../../fixtures/a11y-policy.json';

interface BaselineEntry {
  rule: string;
  reason: string;
}

export interface AccessibilityCheckOptions {
  /** Limit the scan to part of the page. Defaults to the whole document. */
  context?: ElementContext;
  /** Impacts that fail the test. Defaults to `failOnImpacts` in `a11y-policy.json`. */
  failOn?: NonNullable<ImpactValue>[];
  /** Baseline entry to apply. Defaults to the current pathname. */
  baselineKey?: string;
}

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Runs axe-core against the current page using the repo's WCAG 2.1 AA policy.
       * Known, justified violations listed in `fixtures/a11y-policy.json` → `baseline` are skipped;
       * anything else at a failing impact fails the test and is reported in the terminal and the HTML report.
       * @example cy.visit('/login'); cy.checkAccessibility();
       */
      checkAccessibility(options?: AccessibilityCheckOptions): Chainable<void>;
    }
  }
}

const baseline = policy.baseline as Record<string, BaselineEntry[]>;

const reportViolations = (violations: Result[]): void => {
  const rows = violations.map(({ id, impact, nodes, help, helpUrl }) => ({
    rule: id,
    impact,
    nodes: nodes.length,
    help,
    helpUrl,
  }));

  Cypress.log({
    name: 'a11y',
    message: `${violations.length} violation(s): ${rows.map((row) => row.rule).join(', ')}`,
    consoleProps: () => ({ violations }),
  });
  cy.task('table', rows, { log: false });
  cy.addTestContext({ title: 'Accessibility violations', value: rows });
};

Cypress.Commands.add('checkAccessibility', (options: AccessibilityCheckOptions = {}) => {
  cy.location('pathname', { log: false }).then((pathname) => {
    const known = baseline[options.baselineKey ?? pathname] ?? [];

    known.forEach(({ rule, reason }) => {
      Cypress.log({ name: 'a11y baseline', message: `skipping "${rule}": ${reason}` });
    });

    cy.injectAxe();
    cy.checkA11y(
      options.context,
      {
        runOnly: { type: 'tag', values: policy.wcagTags },
        includedImpacts: options.failOn ?? policy.failOnImpacts,
        rules: Object.fromEntries(known.map(({ rule }) => [rule, { enabled: false }])),
      },
      reportViolations,
    );
  });
});

export {};
