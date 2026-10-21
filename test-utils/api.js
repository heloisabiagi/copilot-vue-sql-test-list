const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

process.env.DB_FILE = ':memory:';

const request = require('supertest');
const db = require('../db');
const { app } = require('../server');

const baseUser = {
  name: 'Alice',
  email: 'alice@example.com',
  age: 31,
  country: 'Canada'
};

async function resetDb() {
  await db.ready;
  await db.run('DELETE FROM users');
  await db.run('DELETE FROM sqlite_sequence WHERE name = ?', ['users']);
}

async function seedUser(user = baseUser) {
  const result = await db.run(
    'INSERT INTO users (name, email, age, country) VALUES (?, ?, ?, ?)',
    [user.name, user.email, user.age, user.country]
  );
  return { id: result.id, ...user };
}

module.exports = { request, db, app, baseUser, resetDb, seedUser };