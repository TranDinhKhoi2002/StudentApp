const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subjectSchema = new Schema({
  headTeacher: {
    type: Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
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
