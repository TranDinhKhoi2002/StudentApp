const { validationResult } = require("express-validator");

const Staff = require("../models/staff");
const Account = require("../models/account");

const { checkPrincipalRole } = require("../util/checkStaffAndPricipalRole");

exports.getStaffs = async (req, res, next) => {
  try {
    const staffs = await Staff.find()
      .populate("role");
    res.status(200).json({ staffs: staffs });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getStaff = async (req, res, next) => {
  const staffId = req.params.staffId;

  try {
    const staff = await Staff.findById(staffId)
      .populate("role");
    if (!staff) {
      const error = new Error("Nhân viên giáo vụ không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ staff });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
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

  const {
    username,
    password,
    role,
    name,
    address,
    email,
    phone,
    gender,
    birthday,
  } = req.body;

  try {
    const isAuthorized = await checkPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có hiệu trưởng mới được thêm nhân viên giáo vụ");
      error.statusCode = 401;
      return next(error);
    }

    const hashedPassword = bcryptjs.hashSync(password, 12);
    const account = new Account({ username, password: hashedPassword });
    await account.save();
    const accountId = account._id;

    const staff = new Staff({
      role,
      accountId,
      name,
      address,
      email,
      phone,
      gender,
      birthday,
    });
    await staff.save();
    res.status(200).json({ message: "Tạo nhân viên giáo vụ thành công" });
  } catch (err) {
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

  const staffId = req.params.staffId;
  const { role, name, address, email, phone, gender, birthday } =
    req.body;

  try {
    const isAuthorized = await checkPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error(
        "Chỉ có hiệu trưởng mới được cập nhật thông tin nhân viên giáo vụ"
      );
      error.statusCode = 401;
      return next(error);
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      const error = new Error("Nhân viên giáo vụ không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    staff.name = name;
    staff.gender = gender;
    staff.birthday = birthday;
    staff.address = address;
    staff.email = email;
    staff.phone = phone;
    staff.role = role;
    await staff.save();

    res.status(201).json({ message: "Cập nhật nhân viên giáo vụ thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.deleteStaff = async (req, res, next) => {
  const staffId = req.params.staffId;

  try {
    const isAuthorized = await checkPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có hiệu trưởng mới được xóa nhân viên giáo vụ");
      error.statusCode = 401;
      return next(error);
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      const error = new Error("Nhân viên giáo vụ không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    await Account.findByIdAndRemove(staff.account);
    await Staff.findByIdAndRemove(staffId);

    res.status(200).json({ message: "Xoá nhân viên giáo vụ thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};
