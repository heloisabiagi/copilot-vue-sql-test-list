jest.mock('../db', () => ({
  run: jest.fn(),
  get: jest.fn()
}));

const db = require('../db');
const createUser = require('../rest/createUser');
const updateUser = require('../rest/updateUser');

function createResponse() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
}

describe('Country API validation', () => {
  beforeEach(() => jest.clearAllMocks());

  test.each([createUser, updateUser])('rejects requests without country', async (handler) => {
    const response = createResponse();
    await handler({ body: { name: 'Alice', email: 'alice@example.com', age: 31 }, params: { id: 1 } }, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(db.run).not.toHaveBeenCalled();
  });

  test('trims and persists country when creating a user', async () => {
    const response = createResponse();
    db.run.mockResolvedValue({ id: 4 });
    db.get.mockResolvedValue({ id: 4, name: 'Alice', email: 'alice@example.com', age: 31, country: 'Canada' });

    await createUser({
      body: { name: 'Alice', email: 'alice@example.com', age: 31, country: ' Canada ' }
    }, response);

    expect(db.run).toHaveBeenCalledWith(
      'INSERT INTO users (name, email, age, country) VALUES (?, ?, ?, ?)',
      ['Alice', 'alice@example.com', 31, 'Canada']
    );
    expect(response.status).toHaveBeenCalledWith(201);
  });
});
