const request = require('supertest');
const app = require('../../app');
const { resetDb, seedUser } = require('./helpers');

describe('GET /api/users', () => {
  beforeEach(resetDb);

  test('returns an empty list when there are no users', async () => {
    const response = await request(app).get('/api/users');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  test('returns users newest first with only the public columns', async () => {
    const first = await seedUser({ email: 'first@example.com' });
    const second = await seedUser({ name: 'Bob', email: 'second@example.com', age: 40, country: 'Brazil' });

    const response = await request(app).get('/api/users');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([second, first]);
    expect(Object.keys(response.body[0]).sort()).toEqual(['age', 'country', 'email', 'id', 'name']);
  });
});
