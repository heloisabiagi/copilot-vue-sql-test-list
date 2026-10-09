// Each test file gets its own module registry, so every file opens a fresh in-memory database.
process.env.DB_FILE = ':memory:';
