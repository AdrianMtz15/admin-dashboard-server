const express = require("express");

const { authRoute } = require("../middleware/auth");
const {
  getAllRents,
  getSingleRent,
  createRent,
  updateRent,
  deleteRent,
  endOutdatedRents,
} = require("../controllers/rents");
const router = express.Router();

router.get("/", [authRoute], getAllRents);

router.get("/:rent_id", [authRoute], getSingleRent);

router.post("/", [authRoute], createRent);

router.put("/", [authRoute], updateRent);

router.put("/end-outdated", [authRoute], endOutdatedRents);

router.delete("/:rent_id", [authRoute], deleteRent);

module.exports = router;
