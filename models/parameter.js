const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const parameterSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  min: {
    type: Number,
    min: 0,
  },
  max: {
    type: Number,
  },
});

module.exports = mongoose.model("Parameter", parameterSchema);
