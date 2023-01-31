const Student = require("../models/student");
const Class = require("../models/class");
const Staff = require("../models/staff");
const Teacher = require("../models/teacher");
const Grade = require("../models/grade");

const { checkPrincipalRole } = require("../util/roles");

exports.getStatistics = async (req, res, next) => {
  try {
    const isAuthorized = await checkPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có hiệu trưởng mới được xem số liệu trường");
      error.statusCode = 401;
      return next(error);
    }
    const statistic = {};
    statistic.students = await Student.countDocuments({
      status: "Đang học",
    });
    statistic.teachers = await Teacher.countDocuments({
      status: "Đang dạy",
    });
    statistic.staffs =
      (await Staff.countDocuments({
        status: "Đang làm",
      })) - 1;
    statistic.classes = await Class.countDocuments({
      schoolYear: new Date().getFullYear(),
    });
    res.status(200).json({ statistic });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.getStatisticsByYear = async (req, res, next) => {
  const { year } = req.body;
  try {
    const isAuthorized = await checkPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có hiệu trưởng mới được xem số liệu trường");
      error.statusCode = 401;
      return next(error);
    }

    const statistic = {};
    const classes = await Class.find({ schoolYear: year }).populate("grade").populate("students", "type");
    const grades = await Grade.find().exec();

    for (const grade of grades) {
      statistic["Grade " + grade.name.toString()] = {
        excellentStudents: 0,
        goodStudents: 0,
        averageStudents: 0,
        belowAverageStudents: 0,
        poorStudents: 0,
      };
    }

    for (const schoolClass of classes) {
      for (const student of schoolClass.students) {
        switch (student.type) {
          case "Giỏi":
            statistic["Grade " + schoolClass.grade.name.toString()].excellentStudents += 1;
            break;
          case "Khá":
            statistic["Grade " + schoolClass.grade.name.toString()].goodStudents += 1;
            break;
          case "Trung bình":
            statistic["Grade " + schoolClass.grade.name.toString()].averageStudents += 1;
            break;
          case "Yếu":
            statistic["Grade " + schoolClass.grade.name.toString()].belowAverageStudents += 1;
            break;
          case "Kém":
            statistic["Grade " + schoolClass.grade.name.toString()].poorStudents += 1;
            break;
        }
      }
    }

    res.status(200).json({ statistic, message: "hi111" });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};
