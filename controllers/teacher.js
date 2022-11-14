const Teacher = require("../models/teacher");

exports.getTeachers = async (req, res, next) => {
  console.log(req.query);

  let queries;
  if (!req.query.classes) {
    queries = { ...req.query };
  } else if (req.query.classes === "empty") {
    queries = { ...req.query, classes: [] };
  } else {
    queries = { ...req.query, classes: { $in: req.query.classes } };
  }
  try {
    const teachers = await Teacher.find({ ...queries })
      .populate("subject")
      .populate("role")
      .populate("account")
      .populate("classes");
    if (!teachers) {
      const error = new Error("Có lỗi xảy ra, vui lòng thử lại sau");
      error.statusCode = 404;
      return next(error);
    }

    res.status(200).json({ teachers });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};
