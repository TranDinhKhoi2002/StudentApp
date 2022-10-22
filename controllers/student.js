const { validationResult } = require("express-validator");

const Student = require("../models/student");
const Class = require("../models/class");
const fileHelper = require("../util/file");

const { checkRole } = require("../util/checkRole");

exports.createStudent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const { className, name, gender, birthday, address, email, phone } = req.body;

  try {
    const isAuthorized = await checkRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error(
        "Chỉ có nhân viên giáo vụ hoặc hiệu trưởng mới được thêm học sinh"
      );
      error.statusCode = 401;
      return next(error);
    }

    const selectedClass = await Class.findById(className);
    if (!selectedClass) {
      const error = new Error("Lớp không tồn tại");
      error.statusCode = 422;
      return next(error);
    }

    const student = new Student({
      className,
      name,
      gender,
      birthday,
      address,
      email,
      phone,
    });
    await student.save();

    selectedClass.students.push(student);
    await selectedClass.save();

    res.status(201).json({ message: "Thêm học sinh thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.updateStudent = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const studentId = req.params.studentId;
  const { className, name, gender, birthday, address, email, phone } = req.body;
  let avatarUrl = req.body.image;

  if (req.file) {
    avatarUrl = req.file.path.replace("\\", "/");
  }

  if (!avatarUrl) {
    const error = new Error("Vui lòng chọn hình ảnh");
    error.statusCode = 422;
    return next(error);
  }

  try {
    const isAuthorized = await checkRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error(
        "Chỉ có nhân viên giáo vụ mới được cập nhật thông tin học sinh"
      );
      error.statusCode = 401;
      return next(error);
    }

    const student = await Student.findById(studentId);
    if (!student) {
      const error = new Error("Học sinh không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    if (avatarUrl !== student.avatar) {
      fileHelper.deleteFile(student.avatar);
    }

    student.className = className;
    student.name = name;
    student.gender = gender;
    student.birthday = birthday;
    student.address = address;
    student.email = email;
    student.phone = phone;
    student.avatar = avatarUrl;
    await student.save();

    res.status(201).json({ message: "Cập nhật học sinh thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  const studentId = req.params.studentId;

  try {
    const isAuthorized = await checkRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error(
        "Chỉ có nhân viên giáo vụ hoặc hiệu trưởng mới được thêm học sinh"
      );
      error.statusCode = 401;
      return next(error);
    }

    const student = await Student.findById(studentId);
    const classNameId = student.className.toString();
    if (!student) {
      const error = new Error("Học sinh không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    if (student.avatar.startsWith("/images")) {
      fileHelper.deleteFile(student.avatar);
    }

    await Student.findByIdAndRemove(studentId);

    const className = await Class.findById(classNameId);
    className.students.pull(studentId);
    await className.save();

    res.status(200).json({ message: "Xoá học sinh thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getStudents = async (req, res, next) => {
  const { classId } = req.params;

  try {
    const _class = await Class.findById(classId);
    if (!_class) {
      const error = new Error("Lớp học không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ students: _class.students });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getStudent = async (req, res, next) => {
  const studentId = req.params.studentId;

  try {
    const student = await Student.findById(studentId);
    if (!student) {
      const error = new Error("Học sinh không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ student });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};
