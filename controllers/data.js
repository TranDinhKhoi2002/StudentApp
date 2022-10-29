const Subject = require("../models/subject");
const Teacher = require("../models/teacher");

exports.getData = async (req, res, next) => {
  const accountId = req.accountId;
  try {
    let classes = [];
    const teacher = await Teacher.findOne({ account: accountId })
      .populate("classes")
      .populate("role");
    if (teacher) {
      classes = teacher.classes;
    }

    const subjects = await Subject.find();

    const classesName = classes.map((_class) => _class.name);
    const subjectsName = subjects.map((subject) => subject.name);

    res.status(200).json({
      classes: classesName,
      subjects: subjectsName,
      role: teacher.role.name,
    });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};
