const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const studentScoreSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  classScore: {
    type: Schema.Types.ObjectId,
    ref: "ClassScore",
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

module.exports = mongoose.model("StudentScore", studentScoreSchema);
