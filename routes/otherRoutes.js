const { Router } = require("express");
const { checkPermission } = require("../middlewares/checkPermission");
const otherController = require("../controllers/otherController");

const router = Router();

router.get(
  "/getMe",
  checkPermission(["SHOPPER", "SELLER"]),
  otherController.getMe
);

router.patch(
  "/updateMe",
  checkPermission(["SHOPPER", "SELLER"]),
  otherController.updateMe
);

module.exports = router;
