import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import pluginCypress from 'eslint-plugin-cypress';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'node_modules/',
    'cypress/reports/',
    'cypress/screenshots/',
    'cypress/videos/',
    'cypress/downloads/',
    'cypress/.tmp/',
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      // Custom commands are typed by augmenting `declare global { namespace Cypress { ... } }`.
      '@typescript-eslint/no-namespace': ['error', { allowDeclarations: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['cypress/**/*.ts'],
    extends: [pluginCypress.configs.recommended],
    rules: {
      // Chai assertions such as `expect(x).to.be.true` are expressions by design.
      '@typescript-eslint/no-unused-expressions': 'off',
      // Flaky-test guard rails: no hard waits, no forced clicks, no leftover debugging.
      'cypress/no-unnecessary-waiting': 'error',
      'cypress/no-force': 'error',
      'cypress/no-pause': 'error',
      'cypress/no-debug': 'error',
      'cypress/no-xpath': 'error',
      'cypress/assertion-before-screenshot': 'warn',
      // Never let a focused test reach CI.
      'no-restricted-properties': [
        'error',
        { object: 'describe', property: 'only', message: 'Remove .only before committing.' },
        { object: 'context', property: 'only', message: 'Remove .only before committing.' },
        { object: 'it', property: 'only', message: 'Remove .only before committing.' },
      ],
    },
  },
  prettier,
]);
