const Staff = require("../models/staff");
const Teacher = require("../models/teacher");

exports.checkEmailIsUsed = async (email) => {
  let existingUser = await Teacher.findOne({ email });
  if (!existingUser) {
    existingUser = await Staff.findOne({ email });
  }

  if (existingUser) {
    return true;
  }

  return false;
};

exports.checkPhoneIsUsed = async (phone) => {
  let existingUser = await Teacher.findOne({ phone });
  if (!existingUser) {
    existingUser = await Staff.findOne({ phone });
  }

  if (existingUser) {
    return true;
  }

  return false;
};

exports.checkScoreIsValid = (scores) => {
  if (scores.find((score) => score < 0 || score > 10)) {
    return false;
  }
  return true;
};
