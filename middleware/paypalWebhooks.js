var paypal = require("paypal-rest-sdk");
const { findAppConfigByKey } = require("../actions/appconfig");

var clientId;
var secret;

(async () => {
  const paypalClientId = await findAppConfigByKey('paypal_client_id');
  const paypalClientSecret = await findAppConfigByKey('paypal_client_secret');
  
  clientId = paypalClientId.value;
  secret = paypalClientSecret.value;
})();

paypal.configure({
  mode: process.env.NODE_ENV === "development" ? "sandbox" : "live", //sandbox or live
  client_id: clientId,
  client_secret: secret,
});

const setupWebooks = () => {
  var webhooks = {
    url: process.env.PAYPAL_WEBHOOKS_URL + "/api/webhooks/paypal",
    event_types: [
      {
        name: "INVOICING.INVOICE.PAID",
      },
      {
        name: "INVOICING.INVOICE.CANCELLED",
      },
    ],
  };

  paypal.notification.webhook.create(webhooks, function (err, webhook) {
    if (err) {
      console.log(err.response);
      throw err;
    } else {
      console.log("Create webhook Response");
      console.log(webhook);
    }
  });
};

const listWebhooks = async () =>
  new Promise((resolve, reject) => {
    paypal.notification.webhook.list({}, {}, function (err, response) {
      if (err && err !== null) {
        return reject(err);
      }
      console.log(response.webhooks);
      resolve(response.webhooks);
    });
  });

const deleteWebhook = async (id) =>
  new Promise((resolve, reject) => {
    paypal.notification.webhook.del(id, {}, function (err, response) {
      if (err && err !== null) {
        console.log(err);
        return reject(err);
      }
      resolve(response);
    });
  });

const validateWebhooks = async (request) =>
  new Promise(async (resolve, reject) => {
    let webhookId = await findAppConfigByKey('paypal_webhook_id');
    webhookId = webhookId.value;
    paypal.notification.webhookEvent.verify(
      request.headers,
      request.body,
      webhookId,
      function (err, response) {
        if (err && err !== null) {
          return reject(err);
        }
        resolve(response);
      }
    );
  });

module.exports = {
  setupWebooks,
  listWebhooks,
  validateWebhooks,
  deleteWebhook,
};
