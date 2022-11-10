const { validationResult } = require("express-validator");

const Student = require("../models/student");
const Class = require("../models/class");

const { checkStaffAndPrincipalRole } = require("../util/roles");

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
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có nhân viên giáo vụ hoặc hiệu trưởng mới được thêm học sinh");
      error.statusCode = 401;
      return next(error);
    }

    const selectedClass = await Class.findById(className);
    if (!selectedClass) {
      const error = new Error("Lớp không tồn tại");
      error.statusCode = 422;
      return next(error);
    }

    let existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      const error = new Error("Email đã được sử dụng");
      error.statusCode = 422;
      return next(error);
    }

    existingStudent = await Student.findOne({ phone });
    if (existingStudent) {
      const error = new Error("Số điện thoại đã được sử dụng");
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
  const { className, name, gender, birthday, address, email, phone, status } = req.body;

  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có nhân viên giáo vụ mới được cập nhật thông tin học sinh");
      error.statusCode = 401;
      return next(error);
    }

    const student = await Student.findById(studentId);
    if (!student) {
      const error = new Error("Học sinh không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    student.className = className;
    student.name = name;
    student.gender = gender;
    student.birthday = birthday;
    student.address = address;
    student.email = email;
    student.phone = phone;
    student.status = status;
    await student.save();

    res.status(201).json({ message: "Cập nhật học sinh thành công" });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.deleteStudent = async (req, res, next) => {
  const studentId = req.params.studentId;

  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có nhân viên giáo vụ hoặc hiệu trưởng mới được xóa học sinh");
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

exports.getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find().populate("className");
    if (!students) {
      const error = new Error("Không tìm thấy học sinh nào");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ students });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getStudentsByClassId = async (req, res, next) => {
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
