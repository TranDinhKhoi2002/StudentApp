const fs = require("fs");

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      throw new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    }
  });
};

exports.deleteFile = deleteFile;
