const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const teacherSchema = new Schema({
  subject: {
    type: Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: "Role",
    required: true,
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
  classes: [{ type: Schema.Types.ObjectId, ref: "Class" }],
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["Nam", "Nữ"],
    required: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Đang dạy", "Đã nghỉ"],
    default: "Đang dạy",
  },
});

module.exports = mongoose.model("Teacher", teacherSchema);
