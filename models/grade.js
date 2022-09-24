const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gradeSchema = new Schema({
  name: {
    type: Number,
    min: 10,
    max: 12,
    required: true,
  },
});

module.exports = mongoose.model("Grade", gradeSchema);
