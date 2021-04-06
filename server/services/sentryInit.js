const Sentry = require("@sentry/node");
const env = process.env.NODE_ENV || 'development';
// const Tracing = require("@sentry/tracing");

const SentryInit = Sentry.init({
  dsn: "https://c2597939546c419ea0c56a3d5ab4b6d7@o564925.ingest.sentry.io/5705951",

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  environment: env
});

module.exports.SentryInit = SentryInit;