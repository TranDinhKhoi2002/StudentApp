const Score = require("../models/studentScore");

exports.getScores = async (req, res, next) => {
  const { studentId, subjectId, semesterId, schoolYear } = req.query;
  try {
    const transcriptSubject = await Score.findOne({
      student: studentId,
      subject: subjectId,
      semester: semesterId,
      schoolYear: schoolYear,
    });

    if (!transcriptSubject) {
      const error = new Error("Không tìm thấy bảng điểm nào");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ transcriptSubject });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.updateScore = async (req, res, next) => {
  const { score, index, column, studentId, subjectId, semesterId, schoolYear } =
    req.body;

  try {
    const transcriptSubject = await Score.findOne({
      student: studentId,
      subject: subjectId,
      semester: semesterId,
      schoolYear: schoolYear,
    });

    if (!transcriptSubject) {
      const error = new Error("Không tìm thấy bảng điểm nào");
      error.statusCode = 404;
      return next(error);
    }

    if (index >= transcriptSubject.scores[column].length) {
      const error = new Error("Vị trí của điểm cần sửa không hợp lệ");
      error.statusCode = 422;
      return next(error);
    }

    transcriptSubject.scores[column][index] = score;
    res.status(200).json({ message: "Cập nhật điểm thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};
