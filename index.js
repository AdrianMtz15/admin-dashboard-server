const express = require("express");
const app = express();
const port = 4000;
const path = require("path");
const applyRoutes = require("./routes");
const admin = require("firebase-admin");
const bodyParser = require("body-parser");
const serviceAccount = require("./serviceAccount.json");
const { setupSentry } = require("./middleware/sentry");
const { setupCors } = require("./middleware/cors");
const { createSocket } = require("./functions/socket");
const http = require("http").createServer(app);


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

require("dotenv").config({ path: `${__dirname}/.env` });

const parseJSON = bodyParser.json();
const parseURL = bodyParser.urlencoded({ extended: true });

function shouldParseJSON(req) {
  if (String(req.url).includes("webhook")) return false;
  return true;
}

app.use((req, res, next) =>
  shouldParseJSON(req) ? parseJSON(req, res, next) : next()
);
app.use((req, res, next) =>
  shouldParseJSON(req) ? parseURL(req, res, next) : next()
);

app.use(express.static(path.join(__dirname, 'files')));
app.use(express.static(path.join(__dirname, 'images')));


(async function() {

  await setupCors(app);

  createSocket(http);

  applyRoutes("/api", app);
  
  await setupSentry(app);

  if (process.env.NODE_ENV === "production") {
    app.use(express.static(`${__dirname}/build`));
  
    app.get("/*", (req, res) => {
      res.sendFile(`${__dirname}/build/index.html`);
    });
  }
  
  http.listen(port, () => {
    console.log(`CCT Server running on port ${port}`);
  });

})();