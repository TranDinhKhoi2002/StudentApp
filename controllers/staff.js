const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");

const Staff = require("../models/staff");
const Account = require("../models/account");
const { checkStaffAndPrincipalRole } = require("../util/roles");
const { checkPhoneIsUsed, checkEmailIsUsed } = require("../util/validate");

exports.getStaffs = async (req, res, next) => {
  try {
    const staffs = await Staff.find({ ...req.query, status: "Đang làm" })
      .populate("role")
      .populate("account");
    if (!staffs) {
      const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ staffs });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.createStaff = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const { name, address, email, phone, gender, birthday } = req.body;
  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có hiệu trưởng hoặc nhân viên giáo vụ mới được thêm nhân viên");
      error.statusCode = 401;
      return next(error);
    }

    const hashedPassword = bcryptjs.hashSync("111111", 12);
    const account = new Account({ username: email, password: hashedPassword });
    await account.save();
    const accountId = account._id;

    const staff = new Staff({
      account: accountId,
      name,
      address,
      email,
      phone,
      gender,
      birthday,
    });
    await staff.save();

    res.status(200).json({ message: "Tạo nhân viên thành công" });
  } catch (err) {
    console.log(err);
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.updateStaff = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const { name, address, email, phone, gender, birthday, status } = req.body;
  const staffId = req.params.staffId;

  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có hiệu trưởng hoặc nhân viên giáo vụ mới được cập nhật thông tin nhân viên");
      error.statusCode = 401;
      return next(error);
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      const error = new Error("Nhân viên không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    if (email.toLowerCase() !== staff.email.toLowerCase()) {
      const emailIsUsed = await checkEmailIsUsed(email);
      if (emailIsUsed) {
        const error = new Error("Email đã được sử dụng");
        error.statusCode = 422;
        return next(error);
      }
    }

    if (phone !== staff.phone) {
      const phoneIsUsed = await checkPhoneIsUsed(phone);
      if (phoneIsUsed) {
        const error = new Error("Số điện thoại đã được sử dụng");
        error.statusCode = 422;
        return next(error);
      }
    }

    staff.name = name;
    staff.gender = gender;
    staff.birthday = birthday;
    staff.address = address;
    staff.email = email;
    staff.phone = phone;
    staff.status = status;
    await staff.save();

    res.status(201).json({ message: "Cập nhật nhân viên thành công" });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.deleteStaff = async (req, res, next) => {
  const staffId = req.params.staffId;

  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có hiệu trưởng hoặc nhân viên giáo vụ mới được xóa nhân viên");
      error.statusCode = 401;
      return next(error);
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      const error = new Error("Nhân viên không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    await Account.findByIdAndRemove(staff.account);

    staff.status = "Đã nghỉ";
    await staff.save();

    res.status(200).json({ message: "Xoá nhân viên thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};
