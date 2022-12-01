const Teacher = require("../models/teacher");
const { checkStaffAndPrincipalRole } = require("../util/roles");

exports.getTeachers = async (req, res, next) => {
  console.log(req.query);

  let queries;
  if (!req.query.classes) {
    queries = { ...req.query };
  } else if (req.query.classes === "empty") {
    queries = { ...req.query, classes: [] };
  } else {
    queries = { ...req.query, classes: { $in: req.query.classes } };
  }
  try {
    const teachers = await Teacher.find({ ...queries })
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

exports.updateTeacher = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const { name, address, email, phone, gender, birthday, status } = req.body;
  const teacherId = req.params.teacherId;
  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có hiệu trưởng hoặc nhân viên giáo vụ mới được cập nhật thông tin giáo viên");
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
    teacher.status = status;
    await teacher.save();

    res.status(201).json({ message: "Cập nhật giáo viên thành công" });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};
