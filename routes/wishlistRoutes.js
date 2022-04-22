const { Router } = require("express");
const wishlistController = require("../controllers/wishlistController");
const { checkPermission } = require("../middlewares/checkPermission");

const router = Router();

router.post(
  "/addToWishlist",
  checkPermission(["SHOPPER"]),
  wishlistController.addToWishlist
);

router.post(
  "/removeFromWishlist",
  checkPermission(["SHOPPER"]),
  wishlistController.removeFromWishlist
);

router.get(
  "/getMyWishlist",
  checkPermission(["SHOPPER"]),
  wishlistController.getMyWishlist
);

module.exports = router;
