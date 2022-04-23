const { Router } = require("express");
const authController = require("../controllers/authController");
const shopperController = require("../controllers/shopperController");
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

router.post(
  "/order/getMyOrders",
  checkPermission(["SHOPPER"]),
  shopperController.getMyOrders
);

module.exports = router;
