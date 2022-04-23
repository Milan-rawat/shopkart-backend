const { Router } = require("express");
const authController = require("../controllers/authController");
const shopperController = require("../controllers/shopperController");
const sellerController = require("../controllers/sellerController");
const { checkPermission } = require("../middlewares/checkPermission");

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/codeVerification", authController.codeVerification);
router.post("/sendVerificationCode", authController.sendVerificationCode);
router.post("/resetPassword", authController.resetPassword);

router.post(
  "/changePassword",
  checkPermission(["SHOPPER", "SELLER"]),
  authController.changePassword
);

// --------------SHOPPER----------------
router.post(
  "/order/placeOrder",
  checkPermission(["SHOPPER"]),
  shopperController.placeOrder
);

router.get(
  "/order/getMyOrders",
  checkPermission(["SHOPPER"]),
  shopperController.getMyOrders
);

// --------------SELLER----------------
router.get(
  "/order/getOrdersForMe",
  checkPermission(["SELLER"]),
  sellerController.getOrdersForMe
);

module.exports = router;
