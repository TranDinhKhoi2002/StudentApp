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
    required: true,
  },
  semester: {
    type: Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
  ],
});

module.exports = mongoose.model("Class", classSchema);
