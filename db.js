const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbFile = process.env.DB_FILE || path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile);

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

const ready = new Promise((resolve, reject) => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        age INTEGER,
        country TEXT NOT NULL DEFAULT ''
      )
    `, (createError) => {
      if (createError) return reject(createError);

      db.all('PRAGMA table_info(users)', (schemaError, rows) => {
        if (schemaError) return reject(schemaError);

        const columns = new Set(rows.map((row) => row.name));
        const migrations = [];
        if (!columns.has('age')) migrations.push('ALTER TABLE users ADD COLUMN age INTEGER');
        if (!columns.has('country')) {
          migrations.push("ALTER TABLE users ADD COLUMN country TEXT NOT NULL DEFAULT ''");
        }

        migrations.reduce(
          (previous, migration) => previous.then(() => run(migration)),
          Promise.resolve()
        ).then(resolve, reject);
      });
    });
  });
});

function isDuplicateEmailError(err) {
  return err.code === 'SQLITE_CONSTRAINT' && err.message.includes('users.email');
}

module.exports = { ready, run, get, all, isDuplicateEmailError };
