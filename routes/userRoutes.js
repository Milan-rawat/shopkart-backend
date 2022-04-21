const { Router } = require("express");
const authController = require("../controllers/authController");
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

module.exports = router;