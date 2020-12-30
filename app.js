const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');

const initPassport = require('./passportConfig');

initPassport(passport);

const { registerForm } = require('./server/modules/registerForm');
// const bcrypt = require('bcrypt');

// Set up the express app
const app = express();

// Log requests to the console.
app.use(logger('dev'));

// Allow requests frontend > backend
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: 'secret', // TODO: CHANGE THIS!! ENV VARIABLE SECRET KEY
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

initPassport(passport);

app.set('view engine', 'ejs');

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Require our routes into the application.
require('./server/routes')(app);

app.get('/users/login', (req, res) => {
  res.render("login");
});

app.post('/users/login', passport.authenticate('local', {
  successRedirect: '/users/dashboard',
  failureRedirect: '/users/login',
  failureFlash: true
}))

app.get('/users/register', (req, res) => {
  res.render("register");
});

app.post('/users/register', async (req, res) => {
  registerForm(req, res);
});

app.get('/users/dashboard', (req, res) => {
  res.render("dashboard", { user: req.user });
});

// Setup a default catch-all route that sends back a welcome message in JSON format.
app.get('/', (req, res) => {
  res.render("index");
});

module.exports = app;