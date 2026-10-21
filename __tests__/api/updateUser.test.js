const { request, app, baseUser, db, resetDb, seedUser } = require('../../test-utils/api');

describe('PUT /api/users/:id', () => {
  beforeEach(resetDb);

  test('updates the stored user values', async () => {
    const user = await seedUser({
      name: 'Dana',
      email: 'dana@example.com',
      age: 24,
      country: 'Italy'
    });
    const updatedUser = {
      id: user.id,
      name: 'Dana Updated',
      email: 'dana.updated@example.com',
      age: 35,
      country: 'Germany'
    };

    const res = await request(app)
      .put(`/api/users/${user.id}`)
      .send(updatedUser)
      .expect(200);

    expect(res.body).toEqual(updatedUser);
  });

  test.each([
    ['missing name', { ...baseUser, name: undefined }],
    ['name', { ...baseUser, name: '' }],
    ['missing email', { ...baseUser, email: undefined }],
    ['email', { ...baseUser, email: '' }],
    ['missing age', { ...baseUser, age: undefined }],
    ['age', { ...baseUser, age: '' }],
    ['missing country', { ...baseUser, country: undefined }],
    ['country', { ...baseUser, country: '' }],
    ['blank country', { ...baseUser, country: '   ' }],
    ['non-numeric age', { ...baseUser, age: 'abc' }]
  ])('returns 400 for an invalid %s without changing the user', async (_field, payload) => {
    const originalUser = await seedUser({
      name: 'Existing User',
      email: 'existing@example.com',
      age: 42,
      country: 'Japan'
    });

    const res = await request(app)
      .put(`/api/users/${originalUser.id}`)
      .send(payload)
      .expect(400);

    expect(res.body.error).toMatch(/Name, email, valid age and country required/);
    expect(await db.get(
      'SELECT id, name, email, age, country FROM users WHERE id = ?',
      [originalUser.id]
    )).toEqual(originalUser);
  });
});