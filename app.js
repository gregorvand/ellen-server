const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');

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

app.post('/users/register', (req, res) => {
  let { firstName, lastName, email, password, password2 } = req.body;

  console.log('register creds', {
    firstName,
    lastName,
    email,
    password,
    password2
  })

  let errors = [];

  if (!firstName || !lastName || !email || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password.length < 6) {
    errors.push({ message: "Password must be a least 6 characters long" });
  }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, firstName, lastName, email, password, password2 });
  }
});

app.get('/dashboard', (req, res) => {
  res.render("dashboard", {user: 'greg V static'});
});

// Setup a default catch-all route that sends back a welcome message in JSON format.
app.get('/', (req, res) => {
  res.render("index");
});

module.exports = app;