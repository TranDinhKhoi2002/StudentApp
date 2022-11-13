const Staff = require("../models/staff");
const Subject = require("../models/subject");
const Teacher = require("../models/teacher");
const Class = require("../models/class");
const Semester = require("../models/semester");
const Grade = require("../models/grade");

exports.getData = async (req, res, next) => {
  const accountId = req.accountId;

  const subjects = await Subject.find();
  const semesters = await Semester.find();
  const grades = await Grade.find();

  let classes = await Class.find().populate("grade").populate("teacher").populate("semester").populate("students");
  let role;
  const teacher = await Teacher.findOne({ account: accountId })
    .populate({
      path: "classes",
      populate: { path: "students" },
    })
    .populate("role");
  if (teacher) {
    classes = teacher.classes;
    role = teacher.role.name;
  } else {
    const staff = await Staff.findOne({ account: accountId }).populate("role");
    role = staff.role.name;
  }

  res.status(200).json({
    classes,
    subjects,
    semesters,
    role,
    grades,
  });
};
