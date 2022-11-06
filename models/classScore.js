const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const classScoreSchema = new Schema({
  class: {
    type: Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },
  subject: {
    type: Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
  },
  semester: {
    type: Schema.Types.ObjectId,
    ref: "Semester",
    required: true,
  },
  schoolYear: {
    type: Number,
    required: true,
  },
  studentScores: [
    {
      type: Schema.Types.ObjectId,
      ref: "StudentScore",
      required: true,
    },
  ],
});

module.exports = mongoose.model("ClassScore", classScoreSchema);
