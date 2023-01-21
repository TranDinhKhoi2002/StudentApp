const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const staffSchema = new Schema({
  role: {
    type: Schema.Types.ObjectId,
    ref: "Role",
    default: "eceaeb84ea08fffc51217b3a",
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
    enum: ["Nam", "Nữ"],
    required: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Đang làm", "Đã nghỉ"],
    default: "Đang làm",
  },
});

module.exports = mongoose.model("Staff", staffSchema);
