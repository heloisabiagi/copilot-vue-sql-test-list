const { request, app, resetDb, seedUser } = require('../../test-utils/api');

describe('DELETE /api/users/:id', () => {
  beforeEach(resetDb);

  test('deletes the user', async () => {
    const user = await seedUser({
      name: 'Eve',
      email: 'eve@example.com',
      age: 41,
      country: 'Japan'
    });

    await request(app)
      .delete(`/api/users/${user.id}`)
      .expect(200)
      .expect({ success: true });

    await request(app)
      .get(`/api/users/${user.id}`)
      .expect(404);
  });
});