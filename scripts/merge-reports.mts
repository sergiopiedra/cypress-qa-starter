/**
 * Merges the Mochawesome JSON of every CI shard into one self-contained HTML report and,
 * on GitHub Actions, writes a job summary with totals, failures and flaky tests.
 *
 * Usage: node scripts/merge-reports.mts [inputDir=cypress/reports] [outputDir=cypress/reports/merged]
 */
import { appendFileSync, existsSync, globSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { merge } from 'mochawesome-merge';
import { create } from 'mochawesome-report-generator';

import type { RetriedTest } from '../cypress/plugins/flaky-reporter.ts';

interface MochawesomeTest {
  fullTitle: string;
  state: 'passed' | 'failed' | 'pending' | 'skipped';
  err?: { message?: string };
}

interface MochawesomeSuite {
  file?: string;
  tests: MochawesomeTest[];
  suites: MochawesomeSuite[];
}

interface MochawesomeReport {
  stats: {
    tests: number;
    passes: number;
    failures: number;
    pending: number;
    skipped: number;
    duration: number;
  };
  results: MochawesomeSuite[];
}

const [inputDir = 'cypress/reports', outputDir = 'cypress/reports/merged'] = process.argv.slice(2);

const reportFiles = globSync(join(inputDir, '**/html/index.json'));
if (reportFiles.length === 0) {
  console.error(`No Mochawesome JSON found under ${inputDir}/**/html/index.json`);
  process.exit(1);
}

const report = (await merge({ files: reportFiles })) as MochawesomeReport;
await create(report, {
  reportDir: outputDir,
  reportFilename: 'index.html',
  reportPageTitle: 'cypress-qa-starter',
  inline: true,
  charts: true,
  saveJson: true,
});

const retried: RetriedTest[] = globSync(join(inputDir, '**/flaky/*.json')).flatMap(
  (file) => JSON.parse(readFileSync(file, 'utf8')) as RetriedTest[],
);
const flaky = retried.filter((test) => test.status === 'flaky');

const failures = (function collect(suites: MochawesomeSuite[]): MochawesomeTest[] {
  return suites.flatMap((suite) => [
    ...suite.tests.filter((test) => test.state === 'failed'),
    ...collect(suite.suites),
  ]);
})(report.results);

const { tests, passes, pending, skipped, duration } = report.stats;
console.log(
  `Merged ${reportFiles.length} report(s): ${tests} tests, ${passes} passed, ${failures.length} failed, ` +
    `${flaky.length} flaky → ${join(outputDir, 'index.html')}`,
);

const summaryFile = process.env.GITHUB_STEP_SUMMARY;
if (summaryFile && existsSync(summaryFile)) {
  const lines = [
    `## ${failures.length === 0 ? '✅' : '❌'} Cypress results`,
    '',
    '| Tests | Passed | Failed | Flaky | Pending | Skipped | Duration |',
    '| ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
    `| ${tests} | ${passes} | ${failures.length} | ${flaky.length} | ${pending} | ${skipped} | ${Math.round(duration / 1000)} s |`,
    '',
  ];
  if (failures.length > 0) {
    lines.push(
      '### Failures',
      '',
      ...failures.map(
        (test) => `- **${test.fullTitle}**: ${test.err?.message?.split('\n')[0] ?? ''}`,
      ),
      '',
    );
  }
  if (flaky.length > 0) {
    lines.push(
      '### ⚠️ Flaky (passed after retry)',
      '',
      '| Spec | Test | Attempts |',
      '| --- | --- | ---: |',
      ...flaky.map((test) => `| \`${test.spec}\` | ${test.title} | ${test.attempts} |`),
      '',
    );
  }
  lines.push(
    'Download the **cypress-html-report** artifact for the full report with screenshots.',
    '',
  );
  appendFileSync(summaryFile, lines.join('\n'));
}
