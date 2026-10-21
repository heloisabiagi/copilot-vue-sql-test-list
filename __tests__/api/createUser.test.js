const { request, app, baseUser, resetDb } = require('../../test-utils/api');

describe('POST /api/users', () => {
  beforeEach(resetDb);

  test('creates a user with valid data', async () => {
    const res = await request(app)
      .post('/api/users')
      .send(baseUser)
      .expect(201);

    expect(res.body).toMatchObject(baseUser);
    expect(res.body.id).toBeDefined();
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
  ])('returns 400 for an invalid %s', async (_field, payload) => {
    const res = await request(app)
      .post('/api/users')
      .send(payload)
      .expect(400);

    expect(res.body.error).toMatch(/Name, email, valid age and country required/);
    const users = await request(app).get('/api/users').expect(200);
    expect(users.body).toEqual([]);
  });
});