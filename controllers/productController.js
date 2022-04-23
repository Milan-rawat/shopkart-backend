const Product = require("../models/ProductModel");

const {
  validateBody,
  errorValidation,
  throwErrorMessage,
} = require("../utils/errorHelper");

exports.searchProducts = [
  async (req, res) => {
    try {
      if (req.query.limit > 100 || req.query.limit < 1) {
        return res.status(403).json({
          status: false,
          message: "Limit must be between 1-100",
        });
      }
      if (!req.query.search) {
        return res.status(403).json({
          status: false,
          message: "Search Keyword required to search Products",
        });
      }
      let page = parseInt(req.query.page ? req.query.page : 1);
      let limit = parseInt(req.query.limit ? req.query.limit : 10);
      // let sort = req.query.sort ? req.query.sort : "new";
      let search = req.query.search;
      let skipValue = (page - 1) * limit;

      // let sortBy = -1;
      // if (sort === "old") sortBy = 1;

      let allProducts, count;
      allProducts = await Product.find({
        $or: [
          { productTitle: { $regex: new RegExp(search, "i") } },
          { productDescription: { $regex: new RegExp(search, "i") } },
        ],
      })
        .populate("seller")
        .sort({ updatedAt: -1 })
        .skip(skipValue)
        .limit(limit);
      count = await Product.find({
        $or: [
          { productTitle: { $regex: new RegExp(search, "i") } },
          { productDescription: { $regex: new RegExp(search, "i") } },
        ],
      }).countDocuments();

      res.status(200).json({
        status: true,
        totalData: count,
        totalPage: Math.ceil(count / limit),
        perPage: limit,
        currentPage: page,
        allProducts: allProducts,
      });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.getMyProducts = [
  async (req, res) => {
    try {
      if (req.query.limit > 100 || req.query.limit < 1) {
        return res.status(403).json({
          status: false,
          message: "Limit must be between 1-100",
        });
      }
      let page = parseInt(req.query.page ? req.query.page : 1);
      let limit = parseInt(req.query.limit ? req.query.limit : 10);
      let sort = req.query.sort ? req.query.sort : "new";
      let search = req.query.search ? req.query.search : "";
      let skipValue = (page - 1) * limit;

      let sortBy = -1;
      if (sort === "old") sortBy = 1;

      let allProducts, count;
      if (search && search.length > 0) {
        allProducts = await Product.find({
          $or: [
            { productTitle: { $regex: new RegExp(search, "i") } },
            { productDescription: { $regex: new RegExp(search, "i") } },
          ],
        })
          .populate("seller")
          .sort({ createdAt: sortBy })
          .skip(skipValue)
          .limit(limit);
        count = await Product.find({
          $or: [
            { productTitle: { $regex: new RegExp(search, "i") } },
            { productDescription: { $regex: new RegExp(search, "i") } },
          ],
        }).countDocuments();
      }
      if (!search || search.length <= 0) {
        allProducts = await Product.find()
          .populate("seller")
          .sort({ createdAt: sortBy })
          .skip(skipValue)
          .limit(limit);
        count = await Product.find().countDocuments();
      }

      res.status(200).json({
        status: true,
        totalData: count,
        totalPage: Math.ceil(count / limit),
        perPage: limit,
        currentPage: page,
        allProducts: allProducts,
      });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.addProduct = [
  validateBody(["productTitle", "productDescription", "images", "price"]),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }
    try {
      const product = await Product.create({
        seller: req.user._id,
        productTitle: req.body.productTitle,
        productDescription: req.body.productDescription,
        images: req.body.images,
        price: req.body.price,
      });

      res.status(201).json({
        status: true,
        mesage: "Product Added!",
        product: product,
      });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.updateProduct = [
  validateBody([
    "productId",
    "productTitle",
    "productDescription",
    "images",
    "price",
  ]),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }
    try {
      const product = await Product.findOne({
        $and: [{ _id: req.body.productId }, { seller: req.user._id }],
      });

      if (!product) {
        return res.status(404).json({
          status: false,
          message: "Product Not Found!",
        });
      }
      product.productTitle = req.body.productTitle;
      product.productDescription = req.body.productDescription;
      product.images = req.body.images;
      product.price = req.body.price;

      product.save();

      res.status(200).json({
        status: true,
        mesage: "Product Updated!",
        product: product,
      });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.deleteProduct = [
  validateBody(["productId"]),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }
    try {
      const product = await Product.findOneAndDelete({
        $and: [{ _id: req.body.productId }, { seller: req.user._id }],
      });

      if (!product) {
        return res.status(404).json({
          status: false,
          message: "Product Not Found!",
        });
      }

      res.status(200).json({
        status: true,
        mesage: "Product Deleted!",
      });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];
