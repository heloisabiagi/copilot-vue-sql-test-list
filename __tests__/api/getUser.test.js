const { request, app, resetDb, seedUser } = require('../../test-utils/api');

describe('GET /api/users/:id', () => {
  beforeEach(resetDb);

  test('returns the requested user', async () => {
    const user = await seedUser({
      name: 'Charlie',
      email: 'charlie@example.com',
      age: 28,
      country: 'Spain'
    });

    const res = await request(app)
      .get(`/api/users/${user.id}`)
      .expect(200);

    expect(res.body).toEqual(user);
  });

  test('returns 404 when the user does not exist', async () => {
    const res = await request(app)
      .get('/api/users/9999')
      .expect(404);

    expect(res.body).toEqual({ error: 'User not found' });
  });
});