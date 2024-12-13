const express = require("express");
const {
  deleteUser,
  createUser,
  updateUser,
  getAllUsers,
  getUserById,
  getCurrentUser,
  getUserByPhone,
  getResetPasswordLink,
  getAvailableUsername,
} = require("../controllers/users");
const { isManager } = require("../middleware/admin");
const { authRoute, staffRoute, } = require("../middleware/auth");
const router = express.Router();

router.get("/", [authRoute], getCurrentUser);

router.get("/phone", getUserByPhone);

router.get("/available-username", getAvailableUsername);


router.get("/query", getAllUsers);

router.post("/", createUser);

router.post("/signup", createUser);

router.post(
  "/resetPasswordLink",
  [staffRoute, isManager],
  getResetPasswordLink
);

router.put("/", [authRoute], updateUser);

router.delete("/:user_id", [staffRoute, isManager], deleteUser);

/* Admin */

router.get("/admin", [staffRoute], getAllUsers);

router.get("/admin/:user_id", [staffRoute], getUserById);

module.exports = router;
