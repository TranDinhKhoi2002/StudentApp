const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classSchema = new Schema({
  grade: {
    type: Schema.Types.ObjectId,
    ref: "Grade",
    required: true,
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  schoolYear: {
    type: Number,
    default: new Date().getFullYear(),
  },
  semester: {
    type: Schema.Types.ObjectId,
    ref: "Semester",
    default: "eaacbcf53926b0ab9413ce2a",
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  ],
  schedule: [
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null]
  ],
});

module.exports = mongoose.model("Class", classSchema);
