const Staff = require("../models/staff");
const Teacher = require("../models/teacher");

exports.checkRole = async (accountId) => {
  const existingStaff = await Staff.findOne({ account: accountId });
  const existingTeacher = await Teacher.findOne({
    account: accountId,
  }).populate("role");

  if (existingStaff || existingTeacher.role.name === "Hiệu trưởng") {
    return true;
  }
  return false;
};
