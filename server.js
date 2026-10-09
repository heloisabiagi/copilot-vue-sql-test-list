const express = require('express');
const path = require('path');

const db = require('./db');
const app = require('./app');

const PORT = process.env.PORT || 4000;
const isDevelopment = process.env.NODE_ENV === 'development';

async function startServer() {
	await db.ready;

	if (isDevelopment) {
		const { createServer } = await import('vite');
		const vite = await createServer({ server: { middlewareMode: true } });
		app.use(vite.middlewares);
	} else {
		app.use(express.static(path.join(__dirname, 'dist')));
	}

	app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer().catch((error) => {
	console.error('Failed to start server:', error);
	process.exitCode = 1;
});
