const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  name: {
    type: String,
    enum: [
      "Giáo viên bộ môn",
      "Giáo viên chủ nhiệm",
      "Nhân viên giáo vụ",
      "Hiệu trưởng",
    ],
    required: true,
  },
});

module.exports = mongoose.model("Role", roleSchema);
