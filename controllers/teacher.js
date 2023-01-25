const { validationResult } = require("express-validator");
const bcryptjs = require("bcryptjs");

const Teacher = require("../models/teacher");
const Account = require("../models/account");
const Subject = require("../models/subject");
const Schedule = require("../models/schedule");
const { checkStaffAndPrincipalRole } = require("../util/roles");
const { checkEmailIsUsed, checkPhoneIsUsed } = require("../util/checkExist");

exports.getTeachers = async (req, res, next) => {
  let queries;
  if (!req.query.classes) {
    queries = { ...req.query };
  } else if (req.query.classes === "empty") {
    queries = { ...req.query, classes: [] };
  } else {
    queries = { ...req.query, classes: { $in: req.query.classes } };
  }
  try {
    const teachers = await Teacher.find({ ...queries, status: "Đang dạy" })
      .populate("subject")
      .populate("role")
      .populate("account")
      .populate("classes");
    if (!teachers) {
      const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ teachers });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.getAvailableTeachers = async (req, res, next) => {
  const {
    subjectId,
    dayOfWeek,
    startPeriod,
    endPeriod,
    schoolYear,
    semesterId,
  } = req.body;
  try {
    const requiredSubject = await Subject.findById(subjectId).populate({
      path: "teachers",
      match: { status: "Đang dạy" },
      select: "name",
    });
    if (!requiredSubject) {
      const error = new Error("Môn học không tồn tại");
      error.statusCode = 404;
      return next(error);
    }
    const availableTeachers = [];
    for (let teacher of requiredSubject.teachers) {
      var isAvailable = true;
      const teacherSchedule = await Schedule.findOne({
        teacher: teacher._id,
        schoolYear: schoolYear,
        semester: semesterId,
      });
      for (let i = startPeriod - 1; i < endPeriod; i++) {
        if (teacherSchedule.lessons[i][dayOfWeek] != null) {
          isAvailable = false;
          break;
        }
      }
      if (isAvailable == true)
        availableTeachers.push({
          teacherName: teacher.name,
          teacherId: teacher._id,
        });
    }
    res.status(200).json({ availableTeachers });
  } catch (err) {
    const error = new Error(err.message);
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

  const {
    name,
    address,
    email,
    phone,
    gender,
    birthday,
    status,
    subject,
    role,
  } = req.body;
  const teacherId = req.params.teacherId;

  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error(
        "Chỉ có hiệu trưởng hoặc nhân viên giáo vụ mới được cập nhật thông tin giáo viên"
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

    if (email.toLowerCase() !== teacher.email.toLowerCase()) {
      const emailIsUsed = await checkEmailIsUsed(email);
      if (emailIsUsed) {
        const error = new Error("Email đã được sử dụng");
        error.statusCode = 422;
        return next(error);
      }
    }

    if (phone !== teacher.phone) {
      const phoneIsUsed = await checkPhoneIsUsed(phone);
      if (phoneIsUsed) {
        const error = new Error("Số điện thoại đã được sử dụng");
        error.statusCode = 422;
        return next(error);
      }
    }

    if (subject !== teacher.subject) {
      const oldSubject = await Subject.findById(teacher.subject);
      oldSubject.teachers.pull(teacher._id);
      await oldSubject.save();

      const newSubject = await Subject.findById(subject);
      newSubject.teachers.push(teacher._id);
      await newSubject.save();
    }

    teacher.name = name;
    teacher.gender = gender;
    teacher.birthday = birthday;
    teacher.address = address;
    teacher.email = email;
    teacher.phone = phone;
    teacher.status = status;
    teacher.subject = subject;
    teacher.role = role;
    await teacher.save();

    res.status(201).json({ message: "Cập nhật giáo viên thành công" });
  } catch (err) {
    const error = new Error(err.message);
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

  const { subject, role, name, address, email, phone, gender, birthday } =
    req.body;

  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error(
        "Chỉ có hiệu trưởng hoặc nhân viên giáo vụ mới được thêm giáo viên"
      );
      error.statusCode = 401;
      return next(error);
    }

    const hashedPassword = bcryptjs.hashSync("111111", 12);
    const account = new Account({ username: email, password: hashedPassword });
    await account.save();
    const accountId = account._id;

    const teacher = new Teacher({
      subject,
      role,
      account: accountId,
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
    console.log(err);
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.deleteTeacher = async (req, res, next) => {
  const teacherId = req.params.teacherId;

  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error(
        "Chỉ có hiệu trưởng hoặc nhân viên giáo vụ mới được xóa giáo viên"
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

    await Account.findByIdAndRemove(teacher.account);

    teacher.status = "Đã nghỉ";
    await teacher.save();

    res.status(200).json({ message: "Xoá giáo viên thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};
