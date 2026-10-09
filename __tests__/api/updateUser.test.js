const request = require('supertest');
const app = require('../../app');
const { db, validUser, resetDb, seedUser } = require('./helpers');

describe('PUT /api/users/:id', () => {
  beforeEach(resetDb);

  test('updates the user and persists the changes', async () => {
    const user = await seedUser();
    const changes = { name: 'Alice Smith', email: 'alice.smith@example.com', age: 32, country: ' Portugal ' };

    const response = await request(app).put(`/api/users/${user.id}`).send(changes);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: user.id, ...changes, country: 'Portugal' });

    const stored = await db.get('SELECT id, name, email, age, country FROM users WHERE id = ?', [user.id]);
    expect(stored).toEqual(response.body);
  });

  test('rejects invalid input without changing the user', async () => {
    const user = await seedUser();

    const response = await request(app)
      .put(`/api/users/${user.id}`)
      .send({ ...validUser, country: '' });

    expect(response.status).toBe(400);
    expect(await db.get('SELECT id, name, email, age, country FROM users WHERE id = ?', [user.id])).toEqual(user);
  });

  test('returns 404 for an unknown id', async () => {
    const response = await request(app).put('/api/users/999').send(validUser);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'User not found' });
  });

  test('returns 409 when the email belongs to another user', async () => {
    await seedUser();
    const bob = await seedUser({ name: 'Bob', email: 'bob@example.com' });

    const response = await request(app)
      .put(`/api/users/${bob.id}`)
      .send({ ...validUser, name: 'Bob' });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'Email already in use' });
    expect(await db.get('SELECT email FROM users WHERE id = ?', [bob.id])).toEqual({ email: 'bob@example.com' });
  });
});
