// Response contracts for https://reqres.in. Keep them minimal: only what the tests rely on.

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface ListResponse<T> {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: T[];
}

export interface SingleResponse<T> {
  data: T;
}

export interface UserPayload {
  name: string;
  job: string;
}

export interface CreatedUser extends UserPayload {
  id: string;
  createdAt: string;
}

export interface UpdatedUser extends Partial<UserPayload> {
  updatedAt: string;
}

export type AuthEndpoint = 'register' | 'login';

export interface AuthPayload {
  email?: string;
  password?: string;
}

export interface AuthSuccess {
  id?: number;
  token: string;
}

export interface ApiError {
  error: string;
}
