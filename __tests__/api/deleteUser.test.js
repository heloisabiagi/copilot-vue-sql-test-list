const request = require('supertest');
const app = require('../../app');
const { resetDb, seedUser } = require('./helpers');

describe('DELETE /api/users/:id', () => {
  beforeEach(resetDb);

  test('deletes the user', async () => {
    const user = await seedUser();
    const other = await seedUser({ name: 'Bob', email: 'bob@example.com' });

    const response = await request(app).delete(`/api/users/${user.id}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true });
    expect((await request(app).get(`/api/users/${user.id}`)).status).toBe(404);
    expect((await request(app).get('/api/users')).body).toEqual([other]);
  });

  test('returns 404 for an unknown id', async () => {
    const response = await request(app).delete('/api/users/999');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'User not found' });
  });
});
