import type {
  AuthEndpoint,
  AuthPayload,
  CreatedUser,
  ListResponse,
  SingleResponse,
  UpdatedUser,
  User,
  UserPayload,
} from './types';

type Response<T> = Cypress.Chainable<Cypress.Response<T>>;

/**
 * API Object Model for reqres.in: the API-side counterpart of a Page Object.
 * Each method maps to one endpoint and returns the typed `cy.request` response,
 * leaving status and body assertions to the spec.
 */
export class ReqresClient {
  listUsers(page = 1): Response<ListResponse<User>> {
    return cy.apiRequest<ListResponse<User>>({ url: '/users', qs: { page } });
  }

  getUser(id: number): Response<SingleResponse<User>> {
    return cy.apiRequest<SingleResponse<User>>({ url: `/users/${id}`, failOnStatusCode: false });
  }

  listUsersWithDelay(seconds: number): Response<ListResponse<User>> {
    return cy.apiRequest<ListResponse<User>>({ url: '/users', qs: { delay: seconds } });
  }

  createUser(body: UserPayload): Response<CreatedUser> {
    return cy.apiRequest<CreatedUser>({ method: 'POST', url: '/users', body });
  }

  replaceUser(id: number, body: UserPayload): Response<UpdatedUser> {
    return cy.apiRequest<UpdatedUser>({ method: 'PUT', url: `/users/${id}`, body });
  }

  patchUser(id: number, body: Partial<UserPayload>): Response<UpdatedUser> {
    return cy.apiRequest<UpdatedUser>({ method: 'PATCH', url: `/users/${id}`, body });
  }

  deleteUser(id: number): Response<''> {
    return cy.apiRequest<''>({ method: 'DELETE', url: `/users/${id}` });
  }

  /** Auth endpoints answer 400 for bad input, so never fail on status here. */
  authenticate<T>(endpoint: AuthEndpoint, body: AuthPayload): Response<T> {
    return cy.apiRequest<T>({
      method: 'POST',
      url: `/${endpoint}`,
      body,
      failOnStatusCode: false,
    });
  }
}

export const reqres = new ReqresClient();
