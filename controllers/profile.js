const Staff = require("../models/staff");
const Teacher = require("../models/teacher");
const { checkEmailIsUsed, checkPhoneIsUsed } = require("../util/checkExist");

exports.updateProfile = async (req, res, next) => {
  const accountId = req.accountId;
  const { name, phone, email, address, gender, birthday } = req.body;

  try {
    let user = await Teacher.findOne({ account: accountId });
    if (!user) {
      user = await Staff.findOne({ account: accountId });
    }

    if (!user) {
      const error = new Error("Tài khoản không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    if (email.toLowerCase() !== user.email.toLowerCase()) {
      const emailIsUsed = await checkEmailIsUsed(email);
      if (emailIsUsed) {
        const error = new Error("Email đã được sử dụng");
        error.statusCode = 422;
        return next(error);
      }
    }

    if (phone !== user.phone) {
      const phoneIsUsed = await checkPhoneIsUsed(phone);
      if (phoneIsUsed) {
        const error = new Error("Số điện thoại đã được sử dụng");
        error.statusCode = 422;
        return next(error);
      }
    }

    user.name = name;
    user.phone = phone;
    user.email = email;
    user.address = address;
    user.gender = gender;
    user.birthday = birthday;
    await user.save();

    res.status(201).json({ message: "Cập nhật tài khoản thành công" });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};
