const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const dashboardHelpers = require('./views/helpers/dashboard_helpers');

const Order = require('./server/models').Order;

const initPassport = require('./passportConfig');

initPassport(passport);

const { registerForm } = require('./server/modules/registerForm');

// Set up the express app
const app = express();

// Log requests to the console.
app.use(logger('dev'));

// Allow requests frontend > backend
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: 'secret', // TODO: CHANGE THIS!! ENV VARIABLE SECRET KEY
  resave: false,
  saveUninitialized: true
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

app.get('/users/login', checkAuthenticated, (req, res) => {
  res.render("login");
});

app.post('/users/login', passport.authenticate('local', {
  successRedirect: '/users/dashboard',
  failureRedirect: '/users/login',
  failureFlash: true
}))

app.get('/users/register', checkAuthenticated, (req, res) => {
  res.render("register");
});

app.post('/users/register', async (req, res) => {
  registerForm(req, res);
});

app.get('/users/dashboard', checkNotAuthenticated, (req, res) => {
  getOrders(req.user.id).then((userOrders) => {
    res.render("dashboard", { 
      user: req.user,
      orders: userOrders,
      helpers: dashboardHelpers
    });
  })
});

app.get('/users/logout',(req, res) => {
  req.logOut();
  req.flash('success_msg', 'you have logged out');
  res.redirect('/users/login');
})

// Setup a default catch-all route that sends back a welcome message in JSON format.
app.get('/', (req, res) => {
  res.render("index");
});


// other functions, refactor when possible
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

function getOrders (id) {
  console.log('an id is', id);
  return Order
  .findAll({
    where: {
      customerId: id
    },
    raw : true
  })
  // .then((orders) => console.log('grabbing these orders', orders))
  // .catch((error) => res.status(400).send(error));
};

module.exports = app;