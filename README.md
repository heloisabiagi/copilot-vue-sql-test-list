# Creating a User listing AI app with different agents

This project is part of my experimentation with AI Agents (Copilot, Claude etc) creating a simple RESTful Users list with Vue.js, Unit tests and some pre-commit hooks. It demonstrates a minimal Express REST API with a Vue frontend that stores users in a local SQLite database. In this specific repository, I'll be using mostly Copilot. You can see my experiment with Claude [in this repo](https://github.com/heloisabiagi/claude-vue-sql-test-list).

This project is loosely based on this [YouTube video tutorial](https://www.youtube.com/watch?v=wlpBCazAY9Q&t=377s), but I'm adding my personal preferences.


## Development status

### Log 1: Scaffolding with Copilot

- By using the Agent mode, I've simply asked Copilot to create a RESTful API with Express that saves users to a local SQLite database. The exact prompt was minimalistic ("Create a full REST API with Express that saves users to a local SQLite database. Use Vue.js as frontend framework"), as I wanted to understand what it would come up with on its own. I've specified it to make it a Vue.js app as it's my framework of preference.
- The initial scaffolding immediately generated a working app, which is interesting. The code quality, however, could be better. Both server and client applications are running in the same port, which is not exactly an issue for a small test app, but there are better development practices. 
- Instead of creating different components with scoped style, it simply generated an HTML template and a CSS file. Good for a junior dev, I would say (especially after running the same experiment with Claude).
- I've suggested some code refactoring to separate the Vue.js code into individual components in separate files. It might seem like an overkill for now, but it keeps the code more organized. The code refactoring gave Copilot some extra headache with duplicated code and it took it a while to find the issues that were preventing the app from initialing.
- I've done the a similar suggestion for the REST methods, separating them into individual files. This one was straightforward.
- I've asked it to add some JEST unit tests (didn't give specific details) to both Vue components. As it suggested incompatible dependencies, it took it a while to make the tests run properly. 

### Log 2: Adding a new field, "Age", with Copilot
- I've asked in the prompt for a new field, "Age", to be added to the interface and the API changes. It handled it well with a single prompt. 

### Log 3: Adding Code Rabbit to the repository and testing PR checks
- I've added Code Rabbit to the Github repository and created 2 PRs with simple changes. The first one was ok, the second one, in which I'm changing the name of the labels without updating the tests, was intended to be broken.
- As expected, in the [second PR](https://github.com/heloisabiagi/agentic-ai-vue-test-list/pull/2), the CI tests failed, and the issue was also captured by Code Rabbit - which proactively fixed the issue.

### Log 4: moving all the components to an SFC
- When I asked Copilot to break the generated HTML into components, it has created redundant .js and .vue files for each components to make compilation easier, although that's sketchy. I've asked it to use only a single file per component, which required Vite builds. It took Copilot some time to do it and last time it crashed in an attempt, but this time things went successful

### Log 5: adding API integration tests
- So far, I'd been using exclusively Copilot in this repository, but for API integration tests, I've decided to test Claude and Copilot and ask them to do the same task, adding Integration Tests to the API requests.
- First I've discussed a plan with both agents with the prompt `I'd like to add some integration tests to my application. What tests should I add? Don't do anything yet.`
- Copilot's suggestions prioritized breadth, making a full plan to test API Integration, UI-to-API workflow tests and End to End tests, while Claude limited the plan to API Integrations, but delivered a more in-depth plan which included more test cases for the API requests and also suggesting fixes for the API responses. Both agents suggested using Supertest for sending the requests.
- Although I've stuck with Claude's implementation as it covered more cases, had better readability (with tests for each endpoint put in different files) and also improved the API responses, I was positively surprised with Copilot's suggestion.
- [MR with API integration tests](https://github.com/heloisabiagi/copilot-vue-sql-test-list/pull/8) by Claude and [MR with API integration tests](https://github.com/heloisabiagi/copilot-vue-sql-test-list/pull/9/changes) by Copilot 

--------------------------------------

## Setup

```bash
cd /path/to/copilot-vue-test-list
npm install
npm start
```

Open http://localhost:4000 in your browser.

## API endpoints

- `GET /api/users` — list users
- `GET /api/users/:id` — get a user
- `POST /api/users` — create a user (JSON body `{ name, email }`)
- `PUT /api/users/:id` — update a user
- `DELETE /api/users/:id` — delete a user

## Notes

- The SQLite database file `database.sqlite` will be created automatically in the project root when the server runs.
- The frontend is served from the `public/` folder.

