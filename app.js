const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const { registerForm } = require('./server/modules/registerForm');
// const bcrypt = require('bcrypt');

// Set up the express app
const app = express();

// Log requests to the console.
app.use(logger('dev'));

// Log requests to the console.
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Require our routes into the application.
require('./server/routes')(app);

app.get('/users/login', (req, res) => {
  res.render("login");
});

app.get('/users/register', (req, res) => {
  res.render("register");
});

app.post('/users/register', async (req, res) => {
  registerForm(req, res);
});

app.get('/dashboard', (req, res) => {
  res.render("dashboard", {user: 'greg V static'});
});

// Setup a default catch-all route that sends back a welcome message in JSON format.
app.get('/', (req, res) => {
  res.render("index");
});

module.exports = app;