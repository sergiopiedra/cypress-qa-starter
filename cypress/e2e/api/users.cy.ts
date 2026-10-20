import { reqres } from '../../api/ReqresClient';
import type { User, UserPayload } from '../../api/types';
import newUser from '../../fixtures/api/new-user.json';
import budgets from '../../fixtures/budgets.json';

const { maxResponseTimeMs } = budgets.api;

const expectUser = (user: User): void => {
  expect(user).to.include.all.keys('id', 'email', 'first_name', 'last_name', 'avatar');
  expect(user.id).to.be.a('number');
  expect(user.email).to.match(/^[^@\s]+@reqres\.in$/);
  expect(user.avatar).to.match(/^https:\/\//);
};

describe('reqres users API', { tags: '@api' }, () => {
  context('read', () => {
    [1, 2].forEach((page) => {
      it(`lists users on page ${page}`, { tags: '@smoke' }, () => {
        reqres.listUsers(page).then(({ status, body, duration }) => {
          expect(status).to.eq(200);
          expect(duration, 'response time (ms)').to.be.lessThan(maxResponseTimeMs);
          expect(body.page).to.eq(page);
          expect(body.data).to.have.length(body.per_page);
          body.data.forEach(expectUser);
        });
      });
    });

    it('returns a single user', () => {
      reqres.getUser(2).then(({ status, body }) => {
        expect(status).to.eq(200);
        expectUser(body.data);
        expect(body.data).to.include({ id: 2, first_name: 'Janet', last_name: 'Weaver' });
      });
    });

    it('answers 404 for an unknown user', () => {
      reqres.getUser(23).its('status').should('eq', 404);
    });

    it('honours the delay parameter', { tags: '@slow' }, () => {
      reqres.listUsersWithDelay(2).then(({ status, duration }) => {
        expect(status).to.eq(200);
        expect(duration).to.be.at.least(2000);
      });
    });
  });

  context('write', () => {
    it('creates a user from a fixture', () => {
      // Unique per run, so parallel shards never collide on test data.
      const payload: UserPayload = { ...newUser, name: `${newUser.name} ${Date.now()}` };

      reqres.createUser(payload).then(({ status, body }) => {
        expect(status).to.eq(201);
        expect(body).to.include(payload);
        expect(body.id).to.be.a('string').and.not.be.empty;
        expect(Date.parse(body.createdAt)).to.be.closeTo(Date.now(), 60_000);
      });
    });

    it('replaces a user with PUT', () => {
      reqres.replaceUser(2, newUser).then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body).to.include(newUser);
        expect(body.updatedAt).to.be.a('string');
      });
    });

    it('updates one field with PATCH', () => {
      reqres.patchUser(2, { job: 'Staff QA Engineer' }).then(({ status, body }) => {
        expect(status).to.eq(200);
        expect(body.job).to.eq('Staff QA Engineer');
      });
    });

    it('deletes a user', () => {
      reqres.deleteUser(2).then(({ status, body }) => {
        expect(status).to.eq(204);
        expect(body).to.be.empty;
      });
    });
  });
});
