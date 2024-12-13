const cors = require("cors");
const { findAppConfigByKey } = require("../actions/appconfig");

const setupCors = async (app) => {
  let allowedOrigins = await findAppConfigByKey("allowed_origins");

  if (allowedOrigins === null) {
    return console.log("No Allowed Origins found in appconfig");
  }

  allowedOrigins = allowedOrigins.value;

  app.use(
    cors({
      origin: function (origin, callback) {
        // allow requests with no origin
        // (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
          var msg =
            "The CORS policy for this site does not " +
            "allow access from the specified Origin: " +
            origin;
          return callback(new Error(msg), false);
        }
        return callback(null, true);
      },
    })
  );
};

module.exports = { setupCors }