const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
const axios = require("axios");
const request = require("request");
const { findAppConfigByKey } = require("../actions/appconfig");

/**
 *
 * Returns PayPal HTTP client instance with environment that has access
 * credentials context. Use this instance to invoke PayPal APIs, provided the
 * credentials have access.
 */
const client = async () => {
  const clientEnvironment = await environment();
  return new checkoutNodeJssdk.core.PayPalHttpClient(clientEnvironment);
};

/**
 *
 * Set up and return PayPal JavaScript SDK environment with PayPal access credentials.
 * This sample uses SandboxEnvironment. In production, use LiveEnvironment.
 *
 */
const environment = async () => {
  const paypalClientId = await findAppConfigByKey('paypal_client_id');
  const paypalClientSecret = await findAppConfigByKey('paypal_client_secret');
  let clientId = paypalClientId.value;
  let clientSecret = paypalClientSecret.value;
  if (process.env.NODE_ENV === "development") {
    return new checkoutNodeJssdk.core.SandboxEnvironment(
      clientId,
      clientSecret
    );
  }
  return new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret);
};

const prettyPrint = async (jsonData, pre = "") => {
  let pretty = "";
  function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
  for (let key in jsonData) {
    if (jsonData.hasOwnProperty(key)) {
      if (isNaN(key)) pretty += pre + capitalize(key) + ": ";
      else pretty += pre + (parseInt(key) + 1) + ": ";
      if (typeof jsonData[key] === "object") {
        pretty += "\n";
        pretty += await prettyPrint(jsonData[key], pre + "    ");
      } else {
        pretty += jsonData[key] + "\n";
      }
    }
  }
  return pretty;
};

const createOrder = async (value, currency_code) => {
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  value = parseFloat(value);
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code,
          value,
        },
      },
    ],
  });
  let order;
  const paypalClient = await client();
  try {
    order = await paypalClient.execute(request);
  } catch (error) {
    throw error;
  }
  return order.result.id;
};

const capturePayment = async (orderID) =>
  new Promise(async (resolve, reject) => {
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const paypalClient = await client();
    try {
      paypalClient
        .execute(request)
        .then((capture) => {
          const captureID =
            capture.result.purchase_units[0].payments.captures[0].id;
          resolve(captureID);
        });
    } catch (err) {
      reject(err);
    }
  });

const PayPalAPI = axios.create({
  baseURL: "https://api-m.paypal.com",
});

const getHeaders = async () => {
  const access_token = await getAccessToken();
  return {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  };
};

const createProduct = async (name) => {
  const headers = await getHeaders();
  return PayPalAPI.post(
    "/v1/catalogs/products",
    {
      name: name,
      type: "DIGITAL",
    },
    { ...headers }
  );
};

const createBillingPlan = async (
  name,
  description,
  productID,
  price,
  subscription_period,
  subscription_interval,
  free_trial_length
) => {
  description = String(description).substring(0, 127);
  const headers = await getHeaders();
  const billing_cycles = [];
  if (free_trial_length) {
    billing_cycles.push({
      tenure_type: "TRIAL",
      sequence: 1,
      frequency: {
        interval_unit: "DAY",
        interval_count: free_trial_length,
      },
      total_cycles: 1,
      pricing_scheme: {
        fixed_price: {
          value: 0,
          currency_code: "MXN",
        },
      },
    });
  }
  billing_cycles.push({
    tenure_type: "REGULAR",
    sequence: billing_cycles.length + 1,
    frequency: {
      interval_unit: String(subscription_period).toUpperCase(),
      interval_count: subscription_interval,
    },
    total_cycles: 0,
    pricing_scheme: {
      fixed_price: {
        value: parseFloat(price).toFixed(2),
        currency_code: "MXN",
      },
    },
  });
  const body = {
    name,
    description,
    product_id: productID,
    billing_cycles,
    payment_preferences: {
      auto_bill_outstanding: true,
      payment_failure_threshold: 1,
    },
  };
  return PayPalAPI.post("/v1/billing/plans", body, headers);
};

const createSubscription = async (planID, subscriber, customID) => {
  const headers = await getHeaders();
  return PayPalAPI.post(
    "/v1/billing/subscriptions",
    {
      plan_id: planID,
      subscriber,
      custom_id: customID,
    },
    headers
  );
};

const cancelPayPalSubscription = async (subscriptionID, reason) => {
  const headers = await getHeaders();
  const url = `/v1/billing/subscriptions/${subscriptionID}/cancel`;
  return PayPalAPI.post(
    url,
    {
      reason: reason ? reason : "Unknown",
    },
    headers
  );
};

const getAccessToken = async () => {
  var headers = {
    Accept: "application/json",
    "Accept-Language": "en_US",
  };

  var dataString = "grant_type=client_credentials";

  var options = {
    url: "https://api-m.paypal.com/v1/oauth2/token",
    method: "POST",
    headers: headers,
    body: dataString,
    auth: {
      staff: process.env.PAYPAL_CLIENT_ID,
      pass: process.env.PAYPAL_CLIENT_SECRET,
    },
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        const data = JSON.parse(body);
        resolve(data.access_token);
      } else if (response.statusCode > 400 || error) {
        reject(error);
      }
    });
  });
};

module.exports = {
  client,
  prettyPrint,
  createOrder,
  createProduct,
  getAccessToken,
  capturePayment,
  createBillingPlan,
  createSubscription,
  cancelPayPalSubscription,
};
