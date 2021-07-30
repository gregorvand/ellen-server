require('dotenv').config()

const env = process.env.NODE_ENV || 'development'
const config = require('./server/config/config.json')[env]
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const logger = require('morgan')
const session = require('express-session')
const flash = require('express-flash')
const passport = require('passport')
const Sentry = require('@sentry/node')

const { renderDashboard } = require('./views/rendering/render_dashboard')
const { renderDashboardv2 } = require('./views/rendering/render_dashboardv2')
const { renderCompanyPage } = require('./views/rendering/render_company')
const {
  renderAdminCompanies,
} = require('./views/rendering/render_admin_companies')
const { renderRankedUsers } = require('./views/rendering/render_user_rankings')

const indexHelpers = require('./views/helpers/index_helpers')

// User accounts
const initPassport = require('./passportConfig')
initPassport(passport)

const { registerForm } = require('./server/modules/registerForm')

Sentry.init({
  dsn: 'https://c2597939546c419ea0c56a3d5ab4b6d7@o564925.ingest.sentry.io/5705951',

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  environment: env,
})

// Set up the express app
const app = express()
// app.disable('view cache'); // DO NOT COMMIT THIS

app.use(helmet())
app.use(
  cors({
    origin: [
      'http://localhost:8080',
      'http://localhost:8000',
      'http://localhost:5000',
      'http://206.189.182.91',
      'http://206.189.182.91:8080',
      'http://192.168.0.104',
    ],
  })
)

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        'cdnjs.cloudflare.com',
        'http://localhost:8000',
        'http://localhost:8080',
        'http://localhost:5000',
        'http://206.189.182.91:8080',
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'cdnjs.cloudflare.com',
        'fonts.googleapis.com',
        'http://localhost:8000',
        'https://alpha.ellen.me',
      ],
      fontSrc: [
        "'self'",
        'fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'http://localhost:8000',
        'https://alpha.ellen.me',
      ],
      imgSrc: ["'self'"],
    },
  })
)

// Log requests to the console.
app.use(logger('dev'))

// Allow requests frontend > backend
app.use(express.urlencoded({ extended: false }))

// Static asset serving
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/node_modules'))

// init Sentry across app
// this dropped console logs so needs better integration before activatomg
// app.use(Sentry.Handlers.requestHandler());

console.log('env??', env)
// Production (DigitalOcean-based) and dev Session store PG connections / parameters
if (env === 'production') {
  app.use(
    session(
      {
        store: new (require('connect-pg-simple')(session))({
          conObject: {
            connectionString: process.env.SESSION_PG_CONNECTION, // DigitalOcean DB connection string without ssl param
            ssl: { require: true, rejectUnauthorized: false },
          },
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false, // change to true if we want to identify recurring visitors who are logged out
        cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 }, // 14 days
      },
      console.log('using prod session connect')
    )
  )
} else {
  app.use(
    session(
      {
        store: new (require('connect-pg-simple')(session))({
          conString:
            'pg://' +
            config.username +
            ':' +
            config.password +
            '@' +
            config.host +
            '/' +
            config.database,
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false, // change to true if we want to identify recurring visitors who are logged out
        cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 }, // 14 days
      },
      console.log('using dev session connect')
    )
  )
}

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

initPassport(passport)

app.set('view engine', 'ejs')

// Parse incoming requests data (https://github.com/expressjs/body-parser)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(function (req, res, next) {
  // could do a user lookup here and then store pertinent info for all views like name, email
  res.locals = {
    // make session available to all views
    session: req.session,
    currentUser: req.user,
  }
  next()
})

// Require our routes into the application.
require('./server/routes')(app)

app.get('/users/login', checkAuthenticated, (req, res) => {
  res.render('login')
})

app.get('/users/register', checkAuthenticated, (req, res) => {
  res.render('register')
})

app.post('/users/register', async (req, res) => {
  registerForm(req, res)
})

app.get('/users/dashboard', checkNotAuthenticated, (req, res) => {
  renderDashboardv2(req, res)
})

app.get('/users/profile', checkNotAuthenticated, (req, res) => {
  renderDashboardv2(req, res, 'user_profile')
})

app.get('/users/dashboardv1', checkNotAuthenticated, (req, res) => {
  renderDashboard(req, res)
})

app.get('/users/logout', (req, res) => {
  req.logOut()
  req.flash('success_msg', 'you have logged out')
  res.redirect('/users/login')
})

app.get('/companies/:id', checkNotAuthenticated, (req, res) => {
  renderCompanyPage(req, res)
})

app.get('/admin/companies/', checkNotAuthenticatedAndAdmin, (req, res) => {
  renderAdminCompanies(req, res)
})

app.get('/admin/user-rankings/', checkNotAuthenticatedAndAdmin, (req, res) => {
  renderRankedUsers(req, res)
})

app.get('/earning', (req, res) => {
  res.render('earning')
})

// Setup a default catch-all route that sends back a welcome message in JSON format.
app.get('/', (req, res) => {
  res.render('index', {
    helpers: indexHelpers,
  })
})

// other functions, refactor when possible
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/users/dashboard')
  }
  next()
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/users/login')
}

function checkNotAuthenticatedAndAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.status === 'admin') {
    return next()
  }
  res.redirect('/users/login')
}

// The error handler must be before any other error middleware and after all controllers
app.use(
  Sentry.Handlers.errorHandler({
    shouldHandleError(error) {
      // Capture all 404 and 500 errors
      if (error.status === 404 || error.status === 500) {
        return true
      }
      return false
    },
  })
)

module.exports = app
