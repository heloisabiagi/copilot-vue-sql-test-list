const request = require('supertest');
const app = require('../../app');
const { resetDb, seedUser } = require('./helpers');

describe('GET /api/users/:id', () => {
  beforeEach(resetDb);

  test('returns the requested user', async () => {
    const user = await seedUser();

    const response = await request(app).get(`/api/users/${user.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(user);
  });

  test('returns 404 for an unknown id', async () => {
    const response = await request(app).get('/api/users/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'User not found' });
  });
});
