const express = require("express");
const router = express.Router();
const { getAppConfig, updateAppConfig, getAdminAppConfig } = require("../controllers/appconfig");
const { staffRoute, } = require("../middleware/auth");
const { isAdmin } = require("../middleware/admin");

router.get("/", getAppConfig);

router.get("/admin", [staffRoute, isAdmin], getAdminAppConfig);

router.put("/", [staffRoute, isAdmin], updateAppConfig);

router.put("/public", [staffRoute, isAdmin], updateAppConfig);

module.exports = router;
