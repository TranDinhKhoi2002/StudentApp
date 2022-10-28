const Staff = require("../models/staff");
const Teacher = require("../models/teacher");

exports.checkStaffAndPrincipalRole = async (accountId) => {
  const existingStaff = await Staff.findOne({ account: accountId });
  const existingTeacher = await Teacher.findOne({
    account: accountId,
  }).populate("role");

  if (existingStaff || existingTeacher.role.name === "Hiệu trưởng") {
    return true;
  }
  return false;
};

exports.checkPrincipalRole = async (accountId) => {
  const existingTeacher = await Teacher.findOne({
    account: accountId,
  }).populate("role");

  if (!existingTeacher || existingTeacher.role.name !== "Hiệu trưởng") {
    return false;
  }

  return true;
};

exports.checkTeacherRole = async (accountId) => {
  const existingTeacher = await Teacher.findOne({
    account: accountId,
  }).populate("role");

  if (!existingTeacher) {
    return false;
  }

  if (
    existingTeacher.role.name !== "Giáo viên bộ môn" &&
    existingTeacher.role.name !== "Giáo viên chủ nhiệm"
  ) {
    return false;
  }

  return true;
};
