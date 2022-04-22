const Address = require("../models/AddressModel");
const Cart = require("../models/CartModel");
const Order = require("../models/OrderModel");
const crypto = require("crypto");

const {
  validateBody,
  errorValidation,
  throwErrorMessage,
} = require("../utils/errorHelper");

exports.placeOrder = [
  validateBody(["addressId"]),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }
    try {
      let found = req.user.address.find(
        (item) => item.toString() === req.body.addressId.toString()
      );
      const address = await Address.findOne({ _id: req.body.addressId });

      if (!address || !found) {
        return res.status(404).json({
          status: false,
          message: "Address Not Found!",
        });
      }

      const cart = await Cart.findOne({ shopper: req.user._id }).populate(
        "items.product"
      );
      if (!cart || cart.items.length === 0) {
        return res.status(403).json({
          status: true,
          message: "Cart Empty!",
        });
      }

      let allOrders = [];
      for (let i = 0; i < cart.items.length; i++) {
        let orderId = crypto.randomBytes(16).toString("hex");
        let order = await Order.create({
          order: {
            orderId: orderId,
            totalPrice: cart.items[i].product.price * cart.items[i].quantity,
            address: address,
            item: {
              product: cart.items[i].product._id,
              quantity: cart.items[i].quantity,
            },
          },
          shopper: req.user._id,
          seller: cart.items[i].product.seller,
        });
        allOrders.push(order);
      }

      cart.items = [];
      cart.save();

      res.status(200).json({
        status: true,
        mesage: `${allOrders.length} item order Placed successfully!`,
        orders: allOrders,
      });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];
