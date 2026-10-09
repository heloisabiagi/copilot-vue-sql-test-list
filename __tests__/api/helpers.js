const db = require('../../db');

const validUser = {
  name: 'Alice',
  email: 'alice@example.com',
  age: 31,
  country: 'Canada'
};

async function resetDb() {
  await db.ready;
  await db.run('DELETE FROM users');
  await db.run("DELETE FROM sqlite_sequence WHERE name = 'users'");
}

async function seedUser(overrides = {}) {
  const user = { ...validUser, ...overrides };
  const result = await db.run(
    'INSERT INTO users (name, email, age, country) VALUES (?, ?, ?, ?)',
    [user.name, user.email, user.age, user.country]
  );
  return db.get('SELECT id, name, email, age, country FROM users WHERE id = ?', [result.id]);
}

module.exports = { db, validUser, resetDb, seedUser };
