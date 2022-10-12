const { validationResult } = require("express-validator");
const Subject = require("../models/subject");
const Teacher = require("../models/teacher")

exports.createSubject = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const { name, passScore } = req.body;

  try {
    const subject = new Subject({
      name,
      passScore
    });
    await subject.save();
    res.status(201).json({ message: "Thêm môn học thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.updateSubject = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const subjectId = req.params.subjectId;
  const { name, passScore } = req.body;
  try {
    const subject = await Subject.findById(subjectId);
    if (!subject) {
      const error = new Error("Môn học không tồn tại");
      error.statusCode = 404;
      return next(error);
    }
    subject.name = name;
    subject.passScore =passScore;
    await subject.save();
    res.status(200).json({ message: "Cập nhật môn học thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.deleteSubject = async (req, res, next) => {
    const subjectId = req.params.subjectId;
    try {
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        const error = new Error("Môn học không tồn tại");
        error.statusCode = 404;
        return next(error);
      }
      const teachers = await Teacher.findOne({subject: subjectId})
      if(teachers){
        res.status(400).json({ message: "Môn học vẫn đang được giảng dạy, vui lòng chỉnh sửa thông tin giáo viên trước khi xóa môn học" });
      }
      else{
        await Subject.findByIdAndRemove(subjectId);
        res.status(200).json({ message: "Xóa môn học thành công" });
      }
    } catch (err) {
      const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
      error.statusCode = 500;
      next(error);
    }
  };