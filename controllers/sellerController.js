const Order = require("../models/OrderModel");

const { throwErrorMessage } = require("../utils/errorHelper");

exports.getOrdersForMe = [
  async (req, res) => {
    try {
      if (req.query.limit > 100 || req.query.limit < 1) {
        return res.status(403).json({
          status: "success",
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
          $and: [{ "order.status": status }, { seller: req.user._id }],
        })
          .populate("shopper")
          .sort({ createdAt: sortBy })
          .skip(skipValue)
          .limit(limit);
        count = await Order.find({
          $and: [{ "order.status": status }, { seller: req.user._id }],
        }).countDocuments();
      }
      if (!status || status.length <= 0) {
        allOrders = await Order.find({
          seller: req.user._id,
        })
          .populate("shopper")
          .sort({ createdAt: sortBy })
          .skip(skipValue)
          .limit(limit);
        count = await Order.find({ seller: req.user._id }).countDocuments();
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
