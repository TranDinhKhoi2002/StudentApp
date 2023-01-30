const ClassScore = require("../models/classScore");
const StudentScore = require("../models/studentScore");

const { sum } = require("lodash");
const { checkScoreIsValid } = require("../util/validate");

exports.getScores = async (req, res, next) => {
  try {
    const classScore = await ClassScore.find({
      ...req.query,
    }).populate({
      path: "studentScores",
      populate: { path: "student" },
    });

    if (!classScore) {
      const error = new Error("Không tìm thấy bảng điểm nào");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ classScore });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.getAllScores = async (req, res, next) => {
  try {
    const classScore = await ClassScore.find().populate({
      path: "studentScores",
      populate: { path: "student" },
    });

    if (!classScore) {
      const error = new Error("Không tìm thấy bảng điểm nào");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ classScore });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.updateScore = async (req, res, next) => {
  const { classScoreId, studentId, scores } = req.body;

  try {
    const classScore = await ClassScore.findById(classScoreId);
    if (!classScore) {
      const error = new Error("Bảng điểm không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    const studentScore = await StudentScore.findOne({ classScore: classScoreId, student: studentId });
    if (!studentScore) {
      const error = new Error("Điểm của học sinh không tồn tại");
      error.statusCode = 404;
      return next(error);
    }

    const { oral, m15, m45, final } = scores;

    if (!checkScoreIsValid(oral) || !checkScoreIsValid(m15) || !checkScoreIsValid(m45) || final < 0 || final > 10) {
      const error = new Error("Điểm phải nằm trong khoảng từ 0 đến 10");
      error.statusCode = 422;
      return next(error);
    }

    studentScore.scores.oral = oral;
    studentScore.scores.m15 = m15;
    studentScore.scores.m45 = m45;
    studentScore.scores.final = final;
    studentScore.scores.average = (
      (sum(oral) + sum(m15) + sum(m45) * 2 + sum(final) * 3) /
      (oral.length + m15.length + m45.length * 2 + 3)
    ).toFixed(2);
    await studentScore.save();

    res.status(201).json({ message: "Cập nhật điểm thành công", classScore });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};
