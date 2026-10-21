This is Copilot output for the prompt:
```
I'd like to add some integration tests to my application. What tests should I add? Don't do anything yet.
```

# Best integration tests to add
This app already has solid unit tests around UI behavior and form validation, but the biggest missing gap is the integration layer between the Vue app, the Express API, and SQLite. The highest-value tests are:

## 1) API integration tests
These should hit the real Express routes in server.js and use the real SQLite database (or a temp DB per test).

### Create user

`POST /api/users with valid payload returns 201`
- persisted row contains id, name, email, age, country
- list refreshes with the newly created user
- List users

`GET /api/users returns all users in expected order`
- empty database returns []
- Get single user

`GET /api/users/:id returns the user` 
- missing ID returns 404
- Update user

`PUT /api/users/:id updates age/country/name/email`
- updated data is persisted and returned
- Delete user

`DELETE /api/users/:id removes the record`
- following GET returns 404

### Validation failures

- missing name/email/country/age returns 400
- invalid age like "abc" or blank string is rejected
- duplicate email should fail cleanly if your DB rules enforce it
- These map directly to the logic in createUser.js, updateUser.js, deleteUser.js, and getUser.js.

## 2) UI-to-API workflow tests
These test the actual client flow in app.js rather than isolated component behavior.

### Initial load

- app calls /api/users on mount
- renders user rows with name, email, age, country

### Add user from the modal

- open the form
- submit valid payload
- POST request fires
- list refreshes
- modal closes

### Edit existing user

- start editing a row
- submit updated values
- PUT request fires
- updated values appear in the list

### Delete user

- confirm delete
- DELETE request fires
- row disappears from list

### Validation guard at client level

- blank/invalid age or country prevents submit
- save button or submit flow is blocked

### Race condition coverage

- if a save is in progress, cancel should be ignored
- stale modal session should not overwrite a newer edit flow
- This is especially important because app.js contains client-side gating logic around save state and modal sessions.

## 3) End-to-end browser smoke test
If you want a single high-value integration test, I’d add:

- start the app
- open the page
- add a new user
- confirm it appears in the table
- refresh the page
- confirm the user still exists
- This catches the real client/server/database contract in one flow.

## Recommended priority order
1. POST/PUT/DELETE happy paths
2. 400 validation failures
3. GET by id / 404 not-found
4. full add/edit/delete UI flow
5. browser smoke test

