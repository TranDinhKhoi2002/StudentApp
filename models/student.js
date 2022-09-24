const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentSchema = new Schema({
  className: {
    type: Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  name: {
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
  status: {
    type: String,
    enum: ["Đang học", "Đã tốt nghiệp", "Đã nghỉ học"],
    default: "Đang học",
    required: true,
  },
});

module.exports = mongoose.model("Student", studentSchema);
