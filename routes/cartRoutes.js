const { Router } = require("express");
const cartController = require("../controllers/cartController");
const { checkPermission } = require("../middlewares/checkPermission");

const router = Router();

router.post(
  "/addToCart",
  checkPermission(["SHOPPER"]),
  cartController.addToCart
);

router.post(
  "/removeFromCart",
  checkPermission(["SHOPPER"]),
  cartController.removeFromCart
);

router.patch(
  "/changeQuantity",
  checkPermission(["SHOPPER"]),
  cartController.changeQuantity
);

router.get(
  "/getMyCart",
  checkPermission(["SHOPPER"]),
  cartController.getMyCart
);

module.exports = router;
