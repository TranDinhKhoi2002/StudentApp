const { validationResult } = require("express-validator");
const Student = require("../models/student");
const Class = require("../models/class");

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
    const student = await Student.findById(studentId);
    if (!student) {
      const error = new Error("Học sinh không tồn tại");
      error.statusCode = 404;
      return next(error);
    }
    // Check whether user is staff or not

    if (avatarUrl !== student.avatar) {
      // Delete old avatar
    }
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};
