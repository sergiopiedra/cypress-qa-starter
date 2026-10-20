// Ambient declarations for plugins that ship without TypeScript types.

declare module 'cypress-mochawesome-reporter/plugin' {
  export default function registerMochawesome(on: Cypress.PluginEvents): void;
}

declare module 'mochawesome-merge' {
  export function merge(options: { files: string[] }): Promise<unknown>;
}

declare module 'mochawesome-report-generator' {
  export function create(data: unknown, options: Record<string, unknown>): Promise<string[]>;
}
