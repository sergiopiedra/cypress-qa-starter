import { reqres } from '../../api/ReqresClient';
import type { ApiError, AuthEndpoint, AuthPayload, AuthSuccess } from '../../api/types';
import scenarios from '../../fixtures/api/auth-scenarios.json';

interface AuthScenario {
  title: string;
  endpoint: AuthEndpoint;
  body: AuthPayload;
  status: number;
  expectToken?: boolean;
  error?: string;
}

describe('reqres auth API', { tags: ['@api', '@auth'] }, () => {
  (scenarios as AuthScenario[]).forEach(({ title, endpoint, body, status, expectToken, error }) => {
    it(`${title} (POST /${endpoint} → ${status})`, () => {
      reqres.authenticate<AuthSuccess | ApiError>(endpoint, body).then((response) => {
        expect(response.status).to.eq(status);

        if (expectToken) {
          expect((response.body as AuthSuccess).token).to.be.a('string').and.not.be.empty;
        }
        if (error) {
          expect((response.body as ApiError).error).to.eq(error);
        }
      });
    });
  });
});
