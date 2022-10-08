const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teacherRole = new Schema({
  name: {
    type: String,
    enum: ["Giáo viên bộ môn", "Giáo viên chủ nhiệm"],
    required: true,
  },
});

module.exports = mongoose.model("TeacherRole", teacherRole);
