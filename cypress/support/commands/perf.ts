import type { LighthouseAuditResult, LighthouseThresholds } from '../../plugins/lighthouse';

/**
 * Core Web Vitals captured in the browser. A metric is `undefined` when the browser cannot measure it.
 * TTFB is deliberately absent: `cy.visit` is served through Cypress' proxy, so in-browser TTFB
 * measures the proxy, not the server. Use the Lighthouse `server-response-time` budget instead.
 */
export interface WebVitals {
  /** Largest Contentful Paint (ms). */
  lcp?: number;
  /** Cumulative Layout Shift (unitless, largest 5 s session window). */
  cls?: number;
  /** First Contentful Paint (ms). */
  fcp?: number;
}

type VitalsWindow = Cypress.AUTWindow & { __webVitals?: WebVitals };

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Runs a Lighthouse audit of `path` (relative to `baseUrl`) in the current Chrome instance
       * and fails the test when a category score or metric breaks its threshold.
       * Saves the full HTML report to `cypress/reports/lighthouse/`.
       */
      lighthouse(
        path: string,
        thresholds: LighthouseThresholds,
        formFactor?: 'desktop' | 'mobile',
      ): Chainable<LighthouseAuditResult>;

      /** `cy.visit` that installs PerformanceObservers before any page script runs. */
      visitWithWebVitals(path: string): Chainable<AUTWindow>;

      /** Yields the Core Web Vitals collected since `cy.visitWithWebVitals`. */
      getWebVitals(): Chainable<WebVitals>;
    }
  }
}

const supportedEntryTypes = (win: Cypress.AUTWindow): readonly string[] =>
  win.PerformanceObserver?.supportedEntryTypes ?? [];

/** Runs inside the application window, before its own scripts. */
const observeWebVitals = (win: VitalsWindow): void => {
  const vitals: WebVitals = {};
  win.__webVitals = vitals;

  const observe = (type: string, callback: (entries: PerformanceEntryList) => void): void => {
    try {
      new win.PerformanceObserver((list) => callback(list.getEntries())).observe({
        type,
        buffered: true,
      });
    } catch {
      // Entry type not supported by this browser (e.g. layout-shift in Firefox): leave it undefined.
    }
  };

  observe('largest-contentful-paint', (entries) => {
    vitals.lcp = entries.at(-1)?.startTime;
  });

  observe('paint', (entries) => {
    const fcp = entries.find((entry) => entry.name === 'first-contentful-paint');
    if (fcp) vitals.fcp = fcp.startTime;
  });

  // CLS as defined by web.dev: the worst session window (shifts < 1 s apart, window ≤ 5 s).
  // Starts at 0 because a page without shifts emits no entries at all.
  if (supportedEntryTypes(win).includes('layout-shift')) vitals.cls = 0;
  let sessionValue = 0;
  let sessionStart = 0;
  let lastShift = 0;
  observe('layout-shift', (entries) => {
    for (const entry of entries as (PerformanceEntry & {
      value: number;
      hadRecentInput: boolean;
    })[]) {
      if (entry.hadRecentInput) continue;
      const startsNewSession =
        entry.startTime - lastShift > 1000 || entry.startTime - sessionStart > 5000;
      if (startsNewSession) {
        sessionValue = 0;
        sessionStart = entry.startTime;
      }
      sessionValue += entry.value;
      lastShift = entry.startTime;
      vitals.cls = Math.max(vitals.cls ?? 0, sessionValue);
    }
  });
};

Cypress.Commands.add(
  'lighthouse',
  (path: string, thresholds: LighthouseThresholds, formFactor = 'desktop') => {
    const url = new URL(path, Cypress.config('baseUrl') ?? undefined).toString();

    return cy
      .task<LighthouseAuditResult>(
        'lighthouse',
        { url, thresholds, formFactor },
        { timeout: 120_000 },
      )
      .then((result) => {
        cy.task('table', [{ ...result.scores, ...result.metrics }], { log: false });
        cy.addTestContext({ title: `Lighthouse (${formFactor})`, value: result });
        expect(
          result.failures.length,
          `Lighthouse budget breaches for ${path}: ${result.failures.join('; ') || 'none'}`,
        ).to.eq(0);
        return cy.wrap(result, { log: false });
      });
  },
);

Cypress.Commands.add('visitWithWebVitals', (path: string) =>
  cy.visit(path, { onBeforeLoad: (win) => observeWebVitals(win as VitalsWindow) }),
);

Cypress.Commands.add('getWebVitals', () => {
  // Buffered observer callbacks can land after `load`, so retry until every metric this
  // browser supports has been reported.
  cy.document({ log: false }).its('readyState', { log: false }).should('eq', 'complete');
  cy.window({ log: false, timeout: 10_000 }).should((win) => {
    const vitals = (win as VitalsWindow).__webVitals;
    const supported = supportedEntryTypes(win);

    expect(vitals, 'web vitals observer (use cy.visitWithWebVitals)').to.exist;
    if (supported.includes('paint')) expect(vitals?.fcp, 'FCP').to.be.a('number');
    if (supported.includes('largest-contentful-paint'))
      expect(vitals?.lcp, 'LCP').to.be.a('number');
  });

  return cy.window({ log: false }).then((win) => {
    const vitals: WebVitals = { ...(win as VitalsWindow).__webVitals };

    Cypress.log({
      name: 'web vitals',
      message: Object.entries(vitals)
        .map(
          ([metric, value]) =>
            `${metric}=${value === undefined ? 'n/a' : value.toFixed(metric === 'cls' ? 3 : 0)}`,
        )
        .join(' '),
      consoleProps: () => vitals,
    });
    return vitals;
  });
});

export {};
