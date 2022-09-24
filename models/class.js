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
    type: String,
    required: true,
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: "Student",
    },
  ],
});

module.exports = mongoose.model("Class", classSchema);
