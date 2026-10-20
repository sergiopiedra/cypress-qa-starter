import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export interface RetriedTest {
  spec: string;
  title: string;
  /** `flaky` passed after one or more retries; `failed` never passed. */
  status: 'flaky' | 'failed';
  attempts: number;
}

export const FLAKY_REPORT_DIR = join('cypress', 'reports', 'flaky');

/**
 * Records every test that needed a retry. A test that passes on retry is green in the run,
 * so without this it would silently hide a real problem. CI turns these files into a job summary.
 */
export function registerFlakyReporter(on: Cypress.PluginEvents): void {
  const retried: RetriedTest[] = [];

  on('after:spec', (spec, results) => {
    const specRetried = (results?.tests ?? [])
      .filter((test) => test.attempts.length > 1)
      .map<RetriedTest>((test) => ({
        spec: spec.relative,
        title: test.title.join(' › '),
        status: test.state === 'passed' ? 'flaky' : 'failed',
        attempts: test.attempts.length,
      }));

    if (specRetried.length === 0) return;

    retried.push(...specRetried);
    mkdirSync(FLAKY_REPORT_DIR, { recursive: true });
    writeFileSync(
      join(FLAKY_REPORT_DIR, `${spec.relative.replace(/\W+/g, '-')}.json`),
      JSON.stringify(specRetried, null, 2),
    );
  });

  on('after:run', () => {
    const flaky = retried.filter((test) => test.status === 'flaky');
    if (flaky.length === 0) return;

    console.log(`\n⚠️  ${flaky.length} flaky test(s) passed only after retrying:`);
    console.table(flaky.map(({ spec, title, attempts }) => ({ spec, title, attempts })));
  });
}
