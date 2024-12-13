const express = require("express");
const router = express.Router();
const users = require("./users");
const customers = require("./customers");
const rents = require("./rents");
const files = require("./files");
const products = require("./products");
const appconfig = require("./appconfig");



module.exports = function (base_url, app) {
  router.use("/appconfig", appconfig);
  router.use("/products", products);
  router.use("/users", users);
  router.use("/customers", customers);
  router.use("/rents", rents);
  router.use("/files", files);
  app.use(base_url, router);
};
