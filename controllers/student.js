const { validationResult } = require("express-validator");

const Student = require("../models/student");
const Class = require("../models/class");
const Parameter = require("../models/parameter");

const { checkStaffAndPrincipalRole } = require("../util/roles");
const { CLASS_SIZE, AGE_OF_ADMISSION } = require("../constants/parameter");

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

    const classSizeRegulation = await Parameter.findOne({ name: CLASS_SIZE });
    if (selectedClass.students.length >= classSizeRegulation.max) {
      const error = new Error("Sỉ số lớp học vượt quá mức quy định");
      error.statusCode = 403;
      return next(error);
    }

    const currentAge = new Date().getFullYear() - new Date(birthday).getFullYear();
    const ageRegulation = await Parameter.findOne({ name: AGE_OF_ADMISSION });
    if (currentAge < ageRegulation.min || currentAge > ageRegulation.max) {
      const error = new Error("Học sinh nằm ngoài độ tuổi cho phép để nhập học");
      error.statusCode = 403;
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
  const { className, name, gender, birthday, address, email, phone, conduct, status } = req.body;

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

    if (email.toLowerCase() !== student.email.toLowerCase()) {
      const existingStudent = await Student.find({ email });
      if (existingStudent) {
        const error = new Error("Email đã được sử dụng");
        error.statusCode = 422;
        return next(error);
      }
    }

    if (phone !== student.phone) {
      const existingStudent = await Student.find({ phone });
      if (existingStudent) {
        const error = new Error("Số điện thoại đã được sử dụng");
        error.statusCode = 422;
        return next(error);
      }
    }

    if (className !== student.className) {
      const existingClass = await Class.findById(student.className);
      existingClass.students.pull(studentId);
      await existingClass.save();

      const newClass = await Class.findById(className);
      newClass.students.push(studentId);
      await newClass.save();
    }

    student.className = className;
    student.name = name;
    student.gender = gender;
    student.birthday = birthday;
    student.address = address;
    student.email = email;
    student.phone = phone;
    student.conduct = conduct;
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
