// Loaded before every spec file. Keep it to registrations only.
import { register as registerCypressGrep } from '@cypress/grep';
import 'cypress-mochawesome-reporter/register';

import './commands/auth';

registerCypressGrep();
