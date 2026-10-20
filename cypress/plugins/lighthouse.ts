import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** Category scores are 0–100; metric budgets are in ms, except CLS which is unitless. */
export interface LighthouseThresholds {
  categories: Partial<Record<LighthouseCategory, number>>;
  metrics: Partial<Record<LighthouseMetric, number>>;
}

export type LighthouseCategory = 'performance' | 'accessibility' | 'best-practices' | 'seo';
export type LighthouseMetric =
  | 'first-contentful-paint'
  | 'largest-contentful-paint'
  | 'cumulative-layout-shift'
  | 'total-blocking-time'
  | 'speed-index'
  | 'server-response-time';

export interface LighthouseAuditRequest {
  url: string;
  thresholds: LighthouseThresholds;
  formFactor?: 'desktop' | 'mobile';
}

export interface LighthouseAuditResult {
  url: string;
  scores: Record<string, number>;
  metrics: Record<string, number>;
  /** Human-readable threshold breaches; empty when the page is within budget. */
  failures: string[];
  reportPath: string;
}

const REPORT_DIR = join('cypress', 'reports', 'lighthouse');

let debuggingPort: number | undefined;

/**
 * Wires Lighthouse into Cypress. Lighthouse attaches to the Chrome instance Cypress already
 * drives (through its remote debugging port), so no second browser is launched.
 * Chromium browsers only: Electron and Firefox do not expose the port.
 */
export function registerLighthouse(on: Cypress.PluginEvents): void {
  on('before:browser:launch', (browser, launchOptions) => {
    if (browser.family === 'chromium' && browser.name !== 'electron') {
      const arg = launchOptions.args.find((value) => value.startsWith('--remote-debugging-port='));
      debuggingPort = arg ? Number(arg.split('=')[1]) : undefined;
    }
    return launchOptions;
  });

  on('task', {
    async lighthouse({
      url,
      thresholds,
      formFactor = 'desktop',
    }: LighthouseAuditRequest): Promise<LighthouseAuditResult> {
      if (!debuggingPort) {
        throw new Error(
          'Lighthouse needs a Chromium browser launched by Cypress (e.g. --browser chrome).',
        );
      }

      // Lighthouse is ESM-only, so load it lazily from the CommonJS config.
      const { default: lighthouse, desktopConfig } = await import('lighthouse');
      const runnerResult = await lighthouse(
        url,
        {
          port: debuggingPort,
          output: 'html',
          logLevel: 'error',
          onlyCategories: Object.keys(thresholds.categories),
        },
        formFactor === 'desktop' ? desktopConfig : undefined,
      );
      if (!runnerResult) throw new Error(`Lighthouse returned no result for ${url}`);

      const { lhr, report } = runnerResult;
      const scores = Object.fromEntries(
        Object.entries(lhr.categories).map(([id, { score }]) => [
          id,
          Math.round((score ?? 0) * 100),
        ]),
      );
      const metrics = Object.fromEntries(
        Object.keys(thresholds.metrics).map((id) => [id, lhr.audits[id]?.numericValue ?? NaN]),
      );

      const failures = [
        ...Object.entries(thresholds.categories)
          .filter(([id, min]) => (scores[id] ?? 0) < min)
          .map(([id, min]) => `${id} score ${scores[id]} < ${min}`),
        ...Object.entries(thresholds.metrics)
          .filter(([id, max]) => !((metrics[id] ?? NaN) <= max))
          .map(
            ([id, max]) =>
              `${id} ${metrics[id]?.toFixed(id === 'cumulative-layout-shift' ? 3 : 0)} > ${max}`,
          ),
      ];

      mkdirSync(REPORT_DIR, { recursive: true });
      const reportPath = join(
        REPORT_DIR,
        `${new URL(url).pathname.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home'}-${formFactor}.html`,
      );
      writeFileSync(reportPath, Array.isArray(report) ? report[0]! : report);

      return { url, scores, metrics, failures, reportPath };
    },
  });
}
