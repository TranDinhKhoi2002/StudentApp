const { validationResult } = require("express-validator");

const Teacher = require("../models/teacher");
const Subject = require("../models/subject");
const Account = require("../models/account");
const Class = require("../models/class");

const { checkPrincipalRole } = require("../util/checkStaffAndPricipalRole");

exports.getTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find()
      .populate("subject", "name")
      .populate("role");
    res.status(200).json({ teachers: teachers });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getTeacher = async (req, res, next) => {
  const teacherId = req.params.teacherId;

  try {
    const teacher = await Teacher.findById(teacherId)
      .populate("subject", "name")
      .populate("role");
    if (!teacher) {
      const error = new Error("Giáo viên không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ teacher });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.createTeacher = async (req, res, next) => {
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
    subject,
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
      const error = new Error("Chỉ có hiệu trưởng mới được thêm giáo viên");
      error.statusCode = 401;
      return next(error);
    }

    const hashedPassword = bcryptjs.hashSync(password, 12);
    const account = new Account({ username, password: hashedPassword });
    await account.save();
    const accountId = account._id;

    const teacher = new Teacher({
      subject,
      role,
      accountId,
      name,
      address,
      email,
      phone,
      gender,
      birthday,
    });
    await teacher.save();
    const existingSubject = await Subject.findById(subject);
    existingSubject.teachers.push(teacher);
    res.status(200).json({ message: "Tạo giáo viên thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.updateTeacher = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const teacherId = req.params.teacherId;
  const { subject, role, name, address, email, phone, gender, birthday } =
    req.body;

  try {
    const isAuthorized = await checkPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error(
        "Chỉ có hiệu trưởng mới được cập nhật thông tin giáo viên"
      );
      error.statusCode = 401;
      return next(error);
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      const error = new Error("Giáo viên không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    teacher.name = name;
    teacher.gender = gender;
    teacher.birthday = birthday;
    teacher.address = address;
    teacher.email = email;
    teacher.phone = phone;
    teacher.role = role;

    if (subject != teacher.subject) {
      //Remove teacher from teacher list of old subject
      const prevSubject = await Subject.findById(teacher.subject);
      prevSubject.teachers.pull(teacherId);
      await prevSubject.save();
    }
    teacher.subject = subject;
    await teacher.save();

    //Add teacher to teacher list of current subject
    const currentSubject = await Subject.findById(subject);
    currentSubject.teachers.push(teacher);
    await currentSubject.save();

    res.status(201).json({ message: "Cập nhật giáo viên thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.deleteTeacher = async (req, res, next) => {
  const teacherId = req.params.teacherId;

  try {
    const isAuthorized = await checkPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có hiệu trưởng mới được xóa giáo viên");
      error.statusCode = 401;
      return next(error);
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      const error = new Error("Giáo viên không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    if (teacher.classes.length > 0) {
      Class.find(
        {
          _id: { $in: teacher.classes },
          schoolYear: new Date().getFullYear(),
        },
        function (err, classes) {
          if (classes.length > 0) {
            const error = new Error("Không thể xóa giáo viên đang giảng dạy");
            error.statusCode = 422;
            return next(error);
          }
        }
      );
    }

    const subject = await Subject.findById(teacher.subject);
    subject.teachers.pull(teacherId);
    await subject.save();

    await Account.findByIdAndRemove(teacher.account)

    teacher.status = "Đã nghỉ";
    await teacher.save();

    res.status(200).json({ message: "Xoá giáo viên thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};
