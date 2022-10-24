const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scoreSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "Student",
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
    type: String,
    required: true,
  },
  scores: {
    oral: [
      {
        type: Number,
        min: 0,
        max: 10,
      },
    ],
    m15: [
      {
        type: Number,
        min: 0,
        max: 10,
      },
    ],
    m45: [
      {
        type: Number,
        min: 0,
        max: 10,
      },
    ],
    final: {
      type: Number,
      min: 0,
      max: 10,
    },
    average: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
});

module.exports = mongoose.model("Score", scoreSchema);
