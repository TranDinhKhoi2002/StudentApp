const Class = require("../models/class");

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
      const error = new Error(
        "Chỉ có nhân viên giáo vụ hoặc hiệu trưởng mới được thêm học sinh"
      );
      error.statusCode = 401;
      return next(error);
    }

    const _class = new Class({
      grade,
      teacher,
      name,
      schoolYear,
    });
    await _class.save();

    res.status(201).json({ message: "Thêm lớp thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
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

  const { grade, teacher, name, schoolYear } = req.body;
  const classId = req.params.classId;
  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error(
        "Chỉ có nhân viên giáo vụ hoặc hiệu trưởng mới được thêm học sinh"
      );
      error.statusCode = 401;
      return next(error);
    }

    const updatedClass = await Class.findById(classId);
    updatedClass.grade = grade;
    updatedClass.teacher = teacher;
    updatedClass.name = name;
    updatedClass.schoolYear = schoolYear;
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

    await Class.findByIdAndRemove(classId);
    res.status(200).json({ message: "Xoá lớp thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getClassById = async (req, res, next) => {
  const classId = req.params.classId;
  try {
    const _class = await Class.findById(classId)
      .populate("grade")
      .populate("teacher");
    if (!_class) {
      const error = new Error("Lớp không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ class: _class });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getClasses = async (req, res, next) => {
  try {
    const classes = await Class.find().populate("grade").populate("teacher");
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

exports.getClassesByGrade = async (req, res, next) => {
  const grade = +req.params.grade;
  try {
    const classes = await Class.find().populate("grade").populate("teacher");
    if (!classes) {
      const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
      error.statusCode = 404;
      return next(error);
    }

    const classesByGrade = classes.filter(
      (_class) => _class.grade.name === grade
    );
    res.status(200).json({ classesByGrade });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getClassesByName = async (req, res, next) => {
  const className = req.params.className;
  try {
    const classesByName = await Class.find({ name: className })
      .populate("grade")
      .populate("teacher");
    if (!classesByName) {
      const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ classesByName });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getClassesBySchoolYear = async (req, res, next) => {
  const schoolYear = +req.params.schoolYear;
  try {
    const classesBySchoolYear = await Class.find({ schoolYear })
      .populate("grade")
      .populate("teacher");
    if (!classesBySchoolYear) {
      const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ classesBySchoolYear });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};
