const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbFile = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile);

// Initialize schema
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      age INTEGER,
      country TEXT NOT NULL DEFAULT ''
    )
  `);

  db.all('PRAGMA table_info(users)', (err, rows) => {
    if (err) return;
    const hasAge = rows.some((row) => row.name === 'age');
    if (!hasAge) {
      db.run('ALTER TABLE users ADD COLUMN age INTEGER');
    }
    const hasCountry = rows.some((row) => row.name === 'country');
    if (!hasCountry) {
      db.run("ALTER TABLE users ADD COLUMN country TEXT NOT NULL DEFAULT ''");
    }
  });
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { run, get, all };
