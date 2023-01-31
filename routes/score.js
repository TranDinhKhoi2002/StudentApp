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
    body("classScoreId", "Mã bảng điểm lớp không hợp lệ").isMongoId(),
    body("studentId", "Mã học sinh không hợp lệ").isMongoId(),
    body("scores").isArray().withMessage("Điểm không hợp lệ"),
  ],
  scoreController.updateScore
);

module.exports = router;
