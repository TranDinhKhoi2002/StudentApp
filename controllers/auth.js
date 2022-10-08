const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(
  "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"
);

const Account = require("../models/account");
const Subject = require("../models/subject");
const TeacherRole = require("../models/teacherRole");
const Teacher = require("../models/teacher");

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

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

  const existingAccount = await Account.findOne({ username });
  if (existingAccount) {
    return res.status(422).json({ message: "Tên đăng nhập đã tồn tại" });
  }

  const hashedPassword = bcryptjs.hashSync(password, 12);
  const account = new Account({ username, password: hashedPassword });
  await account.save();

  const existingSubject = await Subject.findOne({ _id: subject });
  if (!existingSubject) {
    return res.status(422).json({ message: "Môn học không tồn tại" });
  }

  const existingTeacherRole = await TeacherRole.findOne({ _id: role });
  if (!existingTeacherRole) {
    return res.status(422).json({ message: "Vai trò không tồn tại" });
  }

  const teacher = new Teacher({
    subject,
    role,
    account: account._id.toString(),
    name,
    address,
    email,
    phone,
    gender,
    birthday,
  });
  await teacher.save();
};

exports.resetPassword = async (req, res, next) => {
  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Có lỗi xảy ra, vui lòng thử lại sau" });
    }

    const token = buffer.toString("hex");
    try {
      const teacher = await Teacher.findOne({ email: req.body.email });
      if (!teacher) {
        return res.status(404).json({ message: "Email không tồn tại" });
      }

      const account = await Account.findOne({
        _id: teacher.account.toString(),
      });
      if (!account) {
        return res.status(404).json({ message: "Tài khoản không tồn tại" });
      }

      account.resetToken = token;
      account.resetTokenExpiration = Date.now() + 3600000;
      await account.save();

      sgMail.send({
        to: req.body.email,
        from: "trandinhkhoi102@gmail.com",
        subject: "Reset Password For Student App",
        html: `
          <p>Bạn vừa gửi yêu cầu khôi phục mật khẩu</p>
          <p>Click vào <a href='http://localhost:3000/reset-password/${token}'>link</a> này để tạo mật khẩu mới</p>
        `,
      });

      res
        .status(200)
        .json({ message: "Gửi yêu cầu khôi phục mật khẩu thành công" });
    } catch (err) {
      const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
      error.statusCode = 500;
      next(error);
    }
  });
};
