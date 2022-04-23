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

exports.getMyOrders = [
  async (req, res) => {
    try {
      if (req.query.limit > 100 || req.query.limit < 1) {
        return res.status(403).json({
          status: true,
          message: "Limit must be between 1-100",
        });
      }
      let page = parseInt(req.query.page ? req.query.page : 1);
      let limit = parseInt(req.query.limit ? req.query.limit : 10);
      let sort = req.query.sort ? req.query.sort : "new";
      let status = req.query.status;
      let skipValue = (page - 1) * limit;

      let sortBy = -1;
      if (sort === "old") sortBy = 1;

      let allOrders, count;
      if (status && status.length > 0) {
        if (
          status !== "PENDING" &&
          status !== "ONGOING" &&
          status !== "DISPATCHED" &&
          status !== "DELIVERED" &&
          status !== "CANCELLED"
        ) {
          return res.status(403).json({
            status: false,
            message: "Not a valid status!",
          });
        }

        allOrders = await Order.find({
          $and: [{ "order.status": status }, { shopper: req.user._id }],
        })
          .populate("seller")
          .sort({ createdAt: sortBy })
          .skip(skipValue)
          .limit(limit);
        count = await Order.find({
          $and: [{ "order.status": status }, { shopper: req.user._id }],
        }).countDocuments();
      }
      if (!status || status.length <= 0) {
        allOrders = await Order.find({
          shopper: req.user._id,
        })
          .populate("seller")
          .sort({ createdAt: sortBy })
          .skip(skipValue)
          .limit(limit);
        count = await Order.find({ shopper: req.user._id }).countDocuments();
      }

      res.status(200).json({
        status: true,
        totalData: count,
        totalPage: Math.ceil(count / limit),
        perPage: limit,
        currentPage: page,
        allOrders: allOrders,
      });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];
