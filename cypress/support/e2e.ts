// Loaded before every spec file. Keep it to registrations only.
import { register as registerCypressGrep } from '@cypress/grep';
import 'cypress-mochawesome-reporter/register';

import './commands/a11y';
import './commands/api';
import './commands/auth';
import './commands/perf';

registerCypressGrep();
