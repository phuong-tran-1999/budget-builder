import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: {
        default: 'nx run budget-builder:serve:development',
        production: 'nx run budget-builder:serve:production',
      },
      ciWebServerCommand: 'nx run budget-builder:serve-static',
    }),
    baseUrl: 'http://localhost:4200',
  },
});
