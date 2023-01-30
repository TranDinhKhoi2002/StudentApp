const { validationResult } = require("express-validator");
const Class = require("../models/class");
const Teacher = require("../models/teacher");
const Subject = require("../models/subject");
const Schedule = require("../models/schedule");
const Semester = require("../models/semester");

const { checkStaffAndPrincipalRole } = require("../util/roles");

exports.createClass = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const { grade, teacher, name, schoolYear } = req.body;
  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có nhân viên giáo vụ hoặc hiệu trưởng mới được thêm lớp");
      error.statusCode = 401;
      return next(error);
    }

    const _class = new Class({
      grade,
      teacher,
      name,
      schoolYear,
      students: [],
    });
    await _class.save();
    const semesters = await Semester.find();
    for (let semester of semesters) {
      const _schedule = new Schedule({
        class: _class._id,
        schoolYear,
        semester: semester._id,
      });
      await _schedule.save();
    }
    const currentTeacher = await Teacher.findById(teacher);
    currentTeacher.classes.push(_class._id);
    await currentTeacher.save();

    res.status(201).json({ message: "Thêm lớp thành công", newClass: _class });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.updateClass = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const { grade, teacher, name } = req.body;
  const classId = req.params.classId;
  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có nhân viên giáo vụ hoặc hiệu trưởng mới được thêm học sinh");
      error.statusCode = 401;
      return next(error);
    }

    const updatedClass = await Class.findById(classId);
    updatedClass.grade = grade;
    updatedClass.name = name;
    if (updatedClass.teacher.toString() !== teacher) {
      const oldTeacher = await Teacher.findById(updatedClass.teacher);
      oldTeacher.classes.pull(classId);
      await oldTeacher.save();

      const newTeacher = await Teacher.findById(teacher);
      newTeacher.classes.push(classId);
      await newTeacher.save();
      updatedClass.teacher = teacher;
    }
    await updatedClass.save();

    res.status(201).json({ message: "Cập nhật lớp thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.deleteClass = async (req, res, next) => {
  const classId = req.params.classId;
  try {
    const _class = await Class.findById(classId);
    if (!_class) {
      const error = new Error("Lớp không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    if (_class.students.length > 0) {
      const error = new Error("Không thể xóa lớp khi đang có học sinh");
      error.statusCode = 422;
      return next(error);
    }

    const currentTeacher = await Teacher.findById(_class.teacher);
    currentTeacher.classes.pull(classId);
    await currentTeacher.save();

    await Class.findByIdAndRemove(classId);
    res.status(200).json({ message: "Xoá lớp thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({ ...req.query })
      .populate("grade")
      .populate("teacher")
      .populate("semester")
      .populate("students");
    if (!classes) {
      const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ classes });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getClassesByYear = async (req, res, next) => {
  const { schoolYear } = req.body;
  try {
    const classes = await Class.find({ schoolYear: schoolYear });
    res.status(200).json({ classes });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};
