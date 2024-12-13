const express = require("express");
const router = express.Router();
const { authRoute } = require("../middleware/auth");
const { getAllCustomers, createCustomer } = require("../controllers/customers");

router.get("/", [authRoute], getAllCustomers);

router.post("/",[authRoute], createCustomer);

// router.put("/", [authRoute], updateUser);

// router.delete("/:user_id", [authRoute], deleteUser);


module.exports = router;
