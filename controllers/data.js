const Staff = require("../models/staff");
const Subject = require("../models/subject");
const Teacher = require("../models/teacher");
const Class = require("../models/class");
const Semester = require("../models/semester");
const Grade = require("../models/grade");
const Role = require("../models/role");

exports.getData = async (req, res, next) => {
  const accountId = req.accountId;

  const subjects = await Subject.find();
  const semesters = await Semester.find();
  const grades = await Grade.find();
  const roles = await Role.find();

  let classes = await Class.find().populate("grade").populate("teacher").populate("semester").populate("students");
  let role;
  let user;
  const teacher = await Teacher.findOne({ account: accountId })
    .populate({
      path: "classes",
      populate: { path: "students" },
    })
    .populate("role");
  if (teacher) {
    classes = teacher.classes;
    role = teacher.role.name;
    user = teacher;
  } else {
    const staff = await Staff.findOne({ account: accountId }).populate("role");
    role = staff.role.name;
    user = staff;
  }

  res.status(200).json({
    classes,
    subjects,
    semesters,
    user,
    role,
    roles,
    grades,
  });
};
