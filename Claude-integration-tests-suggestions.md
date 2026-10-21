This is Claude's output for the prompt:
```
I'd like to add some integration tests to my application. What tests should I add? Don't do anything yet.
```


# API Integration Tests Plan

## Approach
Use **Jest + supertest** to send real HTTP requests to the Express app. The app runs against a **real SQLite database held in memory**, not a mocked `db`. Jest is already set up, so the only new dependency is `supertest`. The existing [UserCountryApi.test.js](__tests__/UserCountryApi.test.js) mocks `db` and calls handlers directly, so it's a unit test. These new tests cover routing, JSON parsing, SQL and the schema together.

## Code changes needed first
1. **Split app creation from startup.** [server.js](server.js) builds the app and calls `listen()` as soon as it's loaded, so tests can't import it without starting a server. Move the middleware and routes into an `app.js` that exports `app`. `server.js` keeps the `db.ready`, Vite/static setup and `listen()`. supertest then takes `app` directly, without a port.
2. **Make the database path configurable.** [db.js](db.js) hardcodes `database.sqlite`, so tests would write to the dev data. Change it to `process.env.DB_FILE || path.join(__dirname, 'database.sqlite')` and set `DB_FILE=':memory:'` for tests.
3. **Use the Node environment for these tests.** [jest.config.cjs](jest.config.cjs) sets `jsdom` for every test. Either add Jest `projects` (a `node` project for `__tests__/api/**` and a `jsdom` project for the Vue tests), or put a `/** @jest-environment node */` comment at the top of each API test file. `projects` is cleaner.

## Test structure
```
__tests__/api/
  helpers.js        // await db.ready; resetDb(): DELETE FROM users + reset sqlite_sequence; seedUser()
  listUsers.test.js
  getUser.test.js
  createUser.test.js
  updateUser.test.js
  deleteUser.test.js
```
- Jest gives each test file its own copy of the modules, so each file gets a fresh in-memory database. Within a file, `beforeEach(resetDb)` keeps tests independent.
- **Create** checks the response, then reads the row back with `GET` or `db.get` to confirm it was saved.

## What to test for each endpoint
| Endpoint | Cases |
|---|---|
| `GET /api/users` | empty list; ordered by `id DESC`; returns exactly the selected columns |
| `GET /api/users/:id` | 200 with the user; 404 for an unknown id |
| `POST /api/users` | 201, trims `country`, turns the age string `"31"` into a number; 400 for each missing field or a non-numeric age; duplicate email |
| `PUT /api/users/:id` | 200 and saved; 400 validation; unknown id |
| `DELETE /api/users/:id` | removes the row (a `GET` afterwards returns 404); unknown id |

## Behaviour the tests will expose
Some of these cases force a decision about what the API should do:
- **Duplicate email** returns **500** with the raw SQLite error. 409 would be more accurate.
- **`PUT` on an unknown id** returns **200 with an empty body**, because `user` is `undefined` in [updateUser.js](rest/updateUser.js). It should probably return 404.
- **`DELETE` on an unknown id** returns `{ success: true }`. That may be intended; the tests would make it explicit.
- **Age** accepts negative numbers and decimals.

Write tests for what the API should do and fix the handlers in the same change, rather than writing tests that lock in the current bugs.

## CI
[ci.yml](.github/workflows/ci.yml) needs no changes. `npm test` picks up the new tests, and `npm ci` builds `sqlite3` on Ubuntu without problems.

## Order of work
1. The `app.js` split, the configurable database path and the Jest config.
2. The tests, one endpoint at a time.
