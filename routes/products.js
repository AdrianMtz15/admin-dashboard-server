const express = require("express");
const {
  createProduct,
  updateProduct,
  getProducts,
  deleteProduct,
  getSingleProduct,
  getAllProducts,
  getSingleProductAdmin,
  getSpecialProducts,
  getSpecialProductsAdmin,
  getSingleSpecialPackage,
  getSingleProductByParams,
  getOrganizerProducts,
  getProductAvailability,
} = require("../controllers/products");
const { isManager } = require("../middleware/admin");
const { staffRoute, authRoute, } = require("../middleware/auth");
const router = express.Router();

router.get("/", [authRoute], getProducts);

router.get("/:product_id", [authRoute], getSingleProduct);

router.get("/availability/:product_id", [authRoute], getProductAvailability);

router.post("/", [authRoute], createProduct);

router.put("/", [authRoute], updateProduct);

router.delete(
  "/:product_id",
  [staffRoute, isManager],
  deleteProduct
);

module.exports = router;
