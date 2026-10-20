// Ambient declarations for plugins that ship without TypeScript types.

declare module 'cypress-mochawesome-reporter/plugin' {
  export default function registerMochawesome(on: Cypress.PluginEvents): void;
}
