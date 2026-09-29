const express = require('express');
const path = require('path');
const cors = require('cors');

const listUsers = require('./rest/listUsers');
const getUser = require('./rest/getUser');
const createUser = require('./rest/createUser');
const updateUser = require('./rest/updateUser');
const deleteUser = require('./rest/deleteUser');

const app = express();
const PORT = process.env.PORT || 4000;
const isDevelopment = process.env.NODE_ENV === 'development';

app.use(cors());
app.use(express.json());

app.get('/api/users', listUsers);
app.get('/api/users/:id', getUser);
app.post('/api/users', createUser);
app.put('/api/users/:id', updateUser);
app.delete('/api/users/:id', deleteUser);

async function startServer() {
	if (isDevelopment) {
		const { createServer } = await import('vite');
		const vite = await createServer({ server: { middlewareMode: true } });
		app.use(vite.middlewares);
	} else {
		app.use(express.static(path.join(__dirname, 'dist')));
	}

	app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
