const { Router } = require("express");
const addressController = require("../controllers/addressController");
const { checkPermission } = require("../middlewares/checkPermission");

const router = Router();

router.get(
  "/getMyAddresses",
  checkPermission(["SHOPPER", "SELLER"]),
  addressController.getMyAddresses
);

router.post(
  "/addAddress",
  checkPermission(["SHOPPER", "SELLER"]),
  addressController.addAddress
);

router.patch(
  "/updateAddress",
  checkPermission(["SHOPPER", "SELLER"]),
  addressController.updateAddress
);

router.delete(
  "/removeAddress",
  checkPermission(["SHOPPER", "SELLER"]),
  addressController.removeAddress
);

module.exports = router;
