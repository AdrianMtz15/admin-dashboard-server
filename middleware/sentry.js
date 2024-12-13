const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");
const { findAppConfigByKey } = require("../actions/appconfig");

const setupSentry = async (app) => {

  let sentry_dsn = await findAppConfigByKey("sentry_dsn"); 

  if(sentry_dsn === null) {
    return console.log("No Sentry DSN found in appconfig");
  }

  sentry_dsn = sentry_dsn.value;

  Sentry.init({
    dsn: sentry_dsn,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });

  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(Sentry.Handlers.requestHandler());

  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

  // The error handler must be before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());

  // Optional fallthrough error handler
  app.use(function onError(error, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the staff for support.
    res.statusCode = 500;
    console.log(error);
    error = JSON.stringify(error);
    error = JSON.parse(error);
    res.status(500).send({ error });
  });
};

module.exports = { setupSentry };
