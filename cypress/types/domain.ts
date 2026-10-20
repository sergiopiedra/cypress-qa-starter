// Shared test-data contracts. Fixtures are cast to these types so specs stay type-safe.

export interface Credentials {
  username: string;
  password: string;
}

export interface LoginScenario extends Credentials {
  title: string;
  outcome: 'success' | 'error';
  message: string;
  tags?: string[];
}

export interface DropdownOption {
  label: string;
  value: string;
}

export interface TableUser {
  lastName: string;
  firstName: string;
  email: string;
  due: string;
  website: string;
}
