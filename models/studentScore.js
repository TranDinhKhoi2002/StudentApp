const { sum } = require("lodash");
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
      default: function () {
        return (
          (sum(this.scores.oral) + sum(this.scores.m15) + sum(this.scores.m45) * 2 + this.scores.final * 3) /
          (this.scores.oral.length + this.scores.m15.length + 2 * this.scores.m45.length + 3)
        ).toFixed(2);
      },
    },
  },
});

module.exports = mongoose.model("StudentScore", studentScoreSchema);
