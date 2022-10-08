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
    ref: "TeacherRole",
    required: true,
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: "Account",
    required: true,
  },
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
    required: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Teacher", teacherSchema);
