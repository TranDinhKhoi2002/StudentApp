const Account = require("../models/account");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const account = await Account.findOne({ username });
    if (!account) {
      const error = new Error("No accounts found");
      error.statusCode = 401;
      return next(error);
    }

    const isValidPassword = bcryptjs.compareSync(password, account.password);
    if (!isValidPassword) {
      const error = new Error("Password is incorrect");
      error.statusCode = 401;
      return next(error);
    }

    const token = jwt.sign(
      {
        username: account.username,
        accountId: account._id.toString(),
      },
      "secret",
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, accountId: account._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.signup = async (req, res, next) => {
  const {
    username,
    password,
    subject,
    role,
    name,
    address,
    email,
    phone,
    gender,
    birthday,
  } = req.body;
};
