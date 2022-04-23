const { Router } = require("express");
const productController = require("../controllers/productController");
const { checkPermission } = require("../middlewares/checkPermission");

const router = Router();

router.get("/searchProducts", productController.searchProducts);

router.get(
  "/getMyProducts",
  checkPermission(["SELLER"]),
  productController.getMyProducts
);

router.post(
  "/addProduct",
  checkPermission(["SELLER"]),
  productController.addProduct
);

router.patch(
  "/updateProduct",
  checkPermission(["SELLER"]),
  productController.updateProduct
);

router.delete(
  "/deleteProduct",
  checkPermission(["SELLER"]),
  productController.deleteProduct
);

module.exports = router;
