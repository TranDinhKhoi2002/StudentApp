const { validationResult } = require("express-validator");
const { SUBJECT_PASSING_SCORE } = require("../constants/parameter");

const Parameter = require("../models/parameter");
const Subject = require("../models/subject");

exports.getRegulations = async (req, res, next) => {
  try {
    const regulations = await Parameter.find();
    res.status(200).json({ regulations });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.createRegulations = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const { name, min, max } = req.body;

  try {
    const existingRegulation = await Parameter.findOne({ name });
    if (existingRegulation) {
      const error = new Error("Quy định này đã tồn tại");
      error.statusCode = 422;
      return next(error);
    }

    const regulation = new Parameter({
      name,
      min,
      max,
    });
    await regulation.save();

    res.status(201).json({ message: "Thêm quy định thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};

exports.updateRegulation = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error(errors.array()[0].msg);
    error.statusCode = 422;
    error.validationErrors = errors.array();
    return next(error);
  }

  const { name, min, max } = req.body;
  const regulationId = req.params.regulationId;

  try {
    const currentRegulation = await Parameter.findById(regulationId);
    if (name !== currentRegulation.name) {
      const existingRegulation = await Parameter.findOne({ name });
      if (existingRegulation) {
        const error = new Error("Quy định đã tồn tại");
        error.statusCode = 422;
        return next(error);
      }
    }

    currentRegulation.name = name;
    currentRegulation.min = min;
    currentRegulation.max = max;
    await currentRegulation.save();

    if (name === SUBJECT_PASSING_SCORE) {
      const subjects = await Subject.find();

      for (const subject of subjects) {
        subject.passScore = min;
        await subject.save();
      }
    }

    res.status(201).json({ message: "Thay đổi quy định thành công" });
  } catch (err) {
    const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
    error.statusCode = 500;
    next(error);
  }
};
