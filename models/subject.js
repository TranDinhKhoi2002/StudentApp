const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subjectSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  passScore: {
    type: Number,
    min: 5,
    max: 10,
    required: true,
  },
});

module.exports = mongoose.model("Subject", subjectSchema);
