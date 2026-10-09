const request = require('supertest');
const app = require('../../app');
const { db, validUser, resetDb, seedUser } = require('./helpers');

describe('POST /api/users', () => {
  beforeEach(resetDb);

  test('creates a user and persists it', async () => {
    const response = await request(app).post('/api/users').send(validUser);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: expect.any(Number), ...validUser });

    const stored = await db.get('SELECT id, name, email, age, country FROM users WHERE id = ?', [response.body.id]);
    expect(stored).toEqual(response.body);
  });

  test('trims country and converts a numeric age string', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ ...validUser, age: ' 31 ', country: '  Canada ' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ age: 31, country: 'Canada' });
  });

  test.each([
    ['name', { name: '' }],
    ['email', { email: undefined }],
    ['age', { age: undefined }],
    ['non-numeric age', { age: 'thirty' }],
    ['country', { country: undefined }],
    ['blank country', { country: '   ' }]
  ])('rejects a request with missing or invalid %s', async (_label, overrides) => {
    const response = await request(app).post('/api/users').send({ ...validUser, ...overrides });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Name, email, valid age and country required' });
    expect(await db.all('SELECT id FROM users')).toEqual([]);
  });

  test('returns 409 when the email is already in use', async () => {
    await seedUser();

    const response = await request(app)
      .post('/api/users')
      .send({ ...validUser, name: 'Another Alice' });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'Email already in use' });
    expect(await db.all('SELECT id FROM users')).toHaveLength(1);
  });
});
