const { request, db, app, resetDb, seedUser } = require('../../test-utils/api');

describe('GET /api/users', () => {
  beforeEach(resetDb);

  test('returns an empty list when there are no users', async () => {
    const res = await request(app)
      .get('/api/users')
      .expect(200);

    expect(res.body).toEqual([]);
  });

  test('returns users in descending id order', async () => {
    const first = await seedUser({ name: 'One', email: 'one@example.com', age: 20, country: 'Brazil' });
    const second = await seedUser({ name: 'Two', email: 'two@example.com', age: 30, country: 'France' });

    const res = await request(app)
      .get('/api/users')
      .expect(200);

    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe(second.id);
    expect(res.body[1].id).toBe(first.id);
    expect(Object.keys(res.body[0]).sort()).toEqual(['age', 'country', 'email', 'id', 'name']);
    expect(await db.all('SELECT id FROM users')).toHaveLength(2);
  });
});