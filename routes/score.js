const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const scoreController = require("../controllers/score");
const isAuth = require("../middleware/is-auth");

router.get("/scores", isAuth, scoreController.getScores);

router.get("/scores/all", isAuth, scoreController.getAllScores);

router.patch(
  "/scores",
  isAuth,
  [
    body("score").isFloat({ min: 0, max: 10 }).withMessage("Điểm phải là số từ 0 đến 10"),
    body("index").isFloat().withMessage("Lần kiểm tra phải là số"),
    body("column", "Cột điểm không hợp lệ").custom((value, { req }) => {
      if (value !== "m15" && value !== "m45" && value !== "oral" && value !== "final") {
        return false;
      }
      return true;
    }),
    body("studentId", "Mã số học sinh không hợp lệ").isMongoId(),
    body("subjectId", "Mã môn học không hợp lệ").isMongoId(),
    body("semesterId", "Mã học kỳ không hợp lệ").isMongoId(),
    body("schoolYear").isNumeric().withMessage("Năm học phải là số"),
  ],
  scoreController.updateScore
);

module.exports = router;
