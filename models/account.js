const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accountSchema = new Schema({
  teacher: {
    type: Schema.Types.ObjectId,
    ref: "Teacher",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Account", accountSchema);
