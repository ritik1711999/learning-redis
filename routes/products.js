const express = require("express");

const router = express.Router();
const cache = require("../middleware/cache");

const {
  getAllProducts,
  getAllProductsStatic,
  getProductByID,
} = require("../controllers/products");

router.route("/").get(getAllProducts);
//router.route("/:id").get(getProductByID);
router.get("/:id", cache, getProductByID);
router.route("/static").get(getAllProductsStatic);

module.exports = router;
