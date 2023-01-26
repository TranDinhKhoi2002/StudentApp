const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
  class: {
    type: Schema.Types.ObjectId,
    ref: "Class",
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: "Teacher",
  },
  schoolYear: {
    type: Number,
  },
  semester: {
    type: Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  lessons: {
    type: Schema.Types.Array,
    default: [
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
      [null, null, null, null, null, null],
    ],
  },
});

module.exports = mongoose.model("Schedule", scheduleSchema);
