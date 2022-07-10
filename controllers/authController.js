const Shopper = require("../models/ShopperModel");
const Seller = require("../models/SellerModel");

const { body } = require("express-validator");
const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const {
  validateBody,
  errorValidation,
  throwErrorMessage,
} = require("../utils/errorHelper");

// ------------CREATE TOKEN WITH JWT
const createToken = (user) => {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.register = [
  validateBody(["email", "password"]),
  body("password").isLength({ min: 8 }),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }
    try {
      const { fullName, password, profilePicture, isSeller } = req.body;
      let email = req.body.email.toLowerCase();

      let Model = Shopper;
      if (isSeller) {
        Model = Seller;
      }

      const user = await Model.findOne({ email: email.toLowerCase() });

      if (user) {
        res.status(409).json({
          status: false,
          message: "Email or Phone already exists! Use different",
        });
      } else {
        let creatingUser = {
          fullName: fullName,
          email: email,
          password: password,
          profilePicture:
            profilePicture && profilePicture.length > 0 ? profilePicture : "",
        };
        const createdUser = await Model.create(creatingUser);

        const verificationCode = createdUser.createVerificationCode();
        const vUser = await createdUser.save();
        const token = createToken(vUser);

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: createdUser.email,
          from: process.env.SENDGRID_EMAIL,
          subject: "Code for Shopkart verification",
          text: `Your Shopkart verification code is: ${verificationCode} \n Verification Code will expire in 10 minutes.`,
          html: `<h3>Your Shopkart verification code is: ${verificationCode}</h3> <p>Verification Code will expire in 10 minutes.<p>`,
        };
        sgMail
          .send(msg)
          .then(() => {
            return res.status(200).json({
              status: true,
              message: "A code sent to your email, please verify!",
              token: token,
              user: vUser,
            });
          })
          .catch((error) => {
            throwErrorMessage(error, res);
          });
      }
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          status: false,
          message: "Email or Phone already exists! Use different",
        });
      }
      throwErrorMessage(err, res);
    }
  },
];
exports.login = [
  validateBody(["email", "password"]),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }
    try {
      const { email, password, isSeller } = req.body;
      let Model = Shopper;
      if (isSeller) {
        Model = Seller;
      }
      const user = await Model.findOne({
        email: email,
      }).select("+password");
      if (!user) {
        res.status(403).json({
          status: false,
          message: "User not found or Incorrect Password!",
        });
      } else {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
          const token = createToken(user);
          res.status(200).json({
            status: true,
            message: "Logged in successfully!",
            token: token,
            user: user,
          });
        } else {
          res.status(403).json({
            status: false,
            message: "User not found or Incorrect Password!",
          });
        }
      }
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.codeVerification = [
  validateBody(["email", "verificationCode"]),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }

    try {
      const { email, verificationCode, isSeller } = req.body;
      let Model = Shopper;
      if (isSeller) {
        Model = Seller;
      }

      const hashedCode = crypto
        .createHash("sha256")
        .update(verificationCode)
        .digest("hex");

      const user = await Model.findOne({
        $and: [
          { email: email },
          { confirmationCode: hashedCode },
          { confirmationCodeExpires: { $gt: Date.now() } },
        ],
      });

      if (!user) {
        return res.status(400).json({
          status: false,
          message: "Code is Invalid or has expired!",
        });
      }

      const token = createToken(user);
      user.emailVerified = true;
      user.confirmationCode = undefined;
      user.confirmationCodeExpires = undefined;

      const confirmedUser = await user.save();

      res.status(200).json({
        status: true,
        message: "Code confirmed!",
        token: token,
        user: confirmedUser,
      });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.sendVerificationCode = [
  validateBody(["email"]),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }

    try {
      const { email, isSeller } = req.body;
      let Model = Shopper;
      if (isSeller) {
        Model = Seller;
      }

      const user = await Model.findOne({ email: email });

      if (!user) {
        return res.status(404).json({
          status: false,
          message: "User Not Found!",
        });
      }
      const verificationCode = user.createVerificationCode();
      const vUser = await user.save();

      console.log("code is: ", verificationCode);
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to: user.email,
        from: process.env.SENDGRID_EMAIL,
        subject: "Code for Shopkart verification",
        text: `Your Shopkart verification code is: ${verificationCode} \n Verification Code will expire in 10 minutes.`,
        html: `<h3>Your Shopkart verification code is: ${verificationCode}</h3> <p>Verification Code will expire in 10 minutes.<p>`,
      };
      sgMail
        .send(msg)
        .then(() => {
          return res.status(200).json({
            status: true,
            message: "A code sent to your email, please verify!",
            user: vUser,
          });
        })
        .catch((error) => {
          throwErrorMessage(error, res);
        });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.resetPassword = [
  validateBody(["email", "verificationCode", "newPassword"]),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be atleast 8 Characters"),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }

    try {
      const { email, verificationCode, newPassword, isSeller } = req.body;
      let Model = Shopper;
      if (isSeller) {
        Model = Seller;
      }

      const hashedCode = crypto
        .createHash("sha256")
        .update(verificationCode)
        .digest("hex");

      const user = await Model.findOne({
        $and: [
          { email: email },
          { confirmationCode: hashedCode },
          { confirmationCodeExpires: { $gt: Date.now() } },
        ],
      });

      if (!user) {
        return res.status(400).json({
          status: false,
          message: "Code is Invalid or has expired!",
        });
      }

      user.confirmationCode = undefined;
      user.confirmationCodeExpires = undefined;
      user.password = newPassword;

      const confirmedUser = await user.save();

      res.status(200).json({
        status: true,
        message: "Password successfully updated!",
        user: confirmedUser,
      });
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];

exports.changePassword = [
  validateBody(["oldPassword", "newPassword"]),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be atleast 8 Characters"),

  async (req, res) => {
    const errors = errorValidation(req, res);
    if (errors) {
      return null;
    }

    try {
      const { oldPassword, newPassword } = req.body;

      const user =
        (await Shopper.findOne({ _id: req.user._id }).select("+password")) ||
        (await Seller.findOne({ _id: req.user._id }).select("+password"));

      if (!user) {
        res.status(404).json({
          status: false,
          message: "User Not Found!",
        });
      } else {
        const auth = await bcrypt.compare(oldPassword, user.password);
        if (auth) {
          user.password = newPassword;
          await user.save();
          const token = createToken(user);
          res.status(200).json({
            status: true,
            message: "Password successfully updated",
            token: token,
            user: user,
          });
        } else {
          res.status(403).json({
            status: false,
            message: "Incorrect Password!",
          });
        }
      }
    } catch (err) {
      throwErrorMessage(err, res);
    }
  },
];
