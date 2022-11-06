const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const staffSchema = new Schema({
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
});

module.exports = mongoose.model("Staff", staffSchema);
