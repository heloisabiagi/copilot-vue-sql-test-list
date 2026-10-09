const express = require('express');
const cors = require('cors');

const listUsers = require('./rest/listUsers');
const getUser = require('./rest/getUser');
const createUser = require('./rest/createUser');
const updateUser = require('./rest/updateUser');
const deleteUser = require('./rest/deleteUser');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/users', listUsers);
app.get('/api/users/:id', getUser);
app.post('/api/users', createUser);
app.put('/api/users/:id', updateUser);
app.delete('/api/users/:id', deleteUser);

module.exports = app;
