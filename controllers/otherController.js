const Shopper = require("../models/ShopperModel");
const Seller = require("../models/SellerModel");

const {
  validateBody,
  errorValidation,
  throwErrorMessage,
} = require("../utils/errorHelper");

const multer = require("multer");
const AWS = require("aws-sdk");
require("dotenv/config");

const AWSCredentials = {
  accessKey: process.env.AWS_ACCESS_KEY,
  secret: process.env.AWS_SECRET_KEY,
  bucketName: process.env.AWS_BUCKET_NAME,
};

const s3 = new AWS.S3({
  accessKeyId: AWSCredentials.accessKey,
  secretAccessKey: AWSCredentials.secret,
});

const storage = multer.memoryStorage({
  destination: function (req, file, cb) {
    cb(null, "");
  },
});

const upload = multer({ storage });

exports.getMe = async (req, res) => {
  try {
    let Model = Shopper;
    if (req.user.userType === "SELLER") Model = Seller;
    let user = await Model.findById(req.user._id).populate("address");

    res.status(200).json({
      status: true,
      me: user,
    });
  } catch (err) {
    throwErrorMessage(err, res);
  }
};

exports.updateMe = async (req, res) => {
  try {
    const { fullName, profilePicture } = req.body;
    let defaultPic =
      "https://t4.ftcdn.net/jpg/03/46/93/61/360_F_346936114_RaxE6OQogebgAWTalE1myseY1Hbb5qPM.jpg";
    req.user.fullName = fullName;
    req.user.profilePicture = profilePicture ? profilePicture : defaultPic;
    req.user.save();

    res.status(200).json({
      status: true,
      me: req.user,
    });
  } catch (err) {
    throwErrorMessage(err, res);
  }
};

exports.uploadFiles = [
  upload.array("files"),
  async (req, res) => {
    let files = req.files;
    let responseData = [];
    files.map((file) => {
      let fileType = file.originalname.split(".")[1];
      let fullDate = new Date();
      let year = fullDate.getFullYear();
      let month = fullDate.getMonth() + 1;
      let day = fullDate.getDate();
      let time = fullDate.getHours();
      let minute = fullDate.getMinutes();
      let second = fullDate.getSeconds();
      let milliSecond = fullDate.getMilliseconds();

      let name = `File_${year}${month}${day}_${time}${minute}${second}${milliSecond}_${
        Math.random().toString().split(".")[1]
      }.${fileType}`;

      const params = {
        Bucket: AWSCredentials.bucketName,
        Key: name,
        Body: file.buffer,
      };

      s3.upload(params, (err, data) => {
        if (err) {
          throwErrorMessage(err, res);
        }
        responseData.push(data);
        if (responseData.length === files.length) {
          return res.status(200).json({
            status: true,
            message: "files uploaded successfully",
            data: responseData,
          });
        }
        return res.status(403).json({
          status: false,
          message: "something went wrong, please try again later",
        });
      });
    });
  },
];
