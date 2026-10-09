const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const request = require('supertest');
const db = require('../db');
const { app } = require('../server');

const baseUser = {
  name: 'Alice',
  email: 'alice@example.com',
  age: 31,
  country: 'Canada'
};

describe('API integration tests', () => {
  beforeEach(async () => {
    await db.run('DELETE FROM users');
    await db.run('DELETE FROM sqlite_sequence WHERE name = ?', ['users']);
  });

  test('POST /api/users creates a user with valid data', async () => {
    const res = await request(app)
      .post('/api/users')
      .send(baseUser)
      .expect(201);

    expect(res.body).toMatchObject({
      name: baseUser.name,
      email: baseUser.email,
      age: baseUser.age,
      country: baseUser.country
    });
    expect(res.body.id).toBeDefined();
  });

  test('GET /api/users returns users in descending id order', async () => {
    const first = await db.run(
      'INSERT INTO users (name, email, age, country) VALUES (?, ?, ?, ?)',
      ['One', 'one@example.com', 20, 'Brazil']
    );
    const second = await db.run(
      'INSERT INTO users (name, email, age, country) VALUES (?, ?, ?, ?)',
      ['Two', 'two@example.com', 30, 'France']
    );

    const res = await request(app)
      .get('/api/users')
      .expect(200);

    expect(res.body).toHaveLength(2);
    expect(res.body[0].id).toBe(second.id);
    expect(res.body[1].id).toBe(first.id);
  });

  test('GET /api/users/:id returns a user when it exists', async () => {
    const created = await db.run(
      'INSERT INTO users (name, email, age, country) VALUES (?, ?, ?, ?)',
      ['Charlie', 'charlie@example.com', 28, 'Spain']
    );

    const res = await request(app)
      .get(`/api/users/${created.id}`)
      .expect(200);

    expect(res.body).toMatchObject({
      id: created.id,
      name: 'Charlie',
      email: 'charlie@example.com',
      age: 28,
      country: 'Spain'
    });
  });

  test('GET /api/users/:id returns 404 when the user does not exist', async () => {
    const res = await request(app)
      .get('/api/users/9999')
      .expect(404);

    expect(res.body).toMatchObject({ error: 'User not found' });
  });

  test('PUT /api/users/:id updates the stored values', async () => {
    const created = await db.run(
      'INSERT INTO users (name, email, age, country) VALUES (?, ?, ?, ?)',
      ['Dana', 'dana@example.com', 24, 'Italy']
    );

    const res = await request(app)
      .put(`/api/users/${created.id}`)
      .send({
        name: 'Dana Updated',
        email: 'dana.updated@example.com',
        age: 35,
        country: 'Germany'
      })
      .expect(200);

    expect(res.body).toMatchObject({
      id: created.id,
      name: 'Dana Updated',
      email: 'dana.updated@example.com',
      age: 35,
      country: 'Germany'
    });
  });

  test('DELETE /api/users/:id removes the user', async () => {
    const created = await db.run(
      'INSERT INTO users (name, email, age, country) VALUES (?, ?, ?, ?)',
      ['Eve', 'eve@example.com', 41, 'Japan']
    );

    await request(app)
      .delete(`/api/users/${created.id}`)
      .expect(200)
      .expect({ success: true });

    await request(app)
      .get(`/api/users/${created.id}`)
      .expect(404);
  });

  test('POST /api/users rejects invalid payloads', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        name: 'No Age',
        email: 'noage@example.com',
        country: 'Canada'
      })
      .expect(400);

    expect(res.body.error).toMatch(/Name, email, valid age and country required/);
  });
});
