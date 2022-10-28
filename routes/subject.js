const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const subjectController = require("../controllers/subject");
const isAuth = require("../middleware/is-auth");

const Subject = require("../models/subject");

router.get("/subjects", isAuth, subjectController.getSubjects);

router.get("/subjects/:subjectId", isAuth, subjectController.getSubject);

const subjectAuthentication = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Tên không được để trống")
    .custom((value, { req }) => {
      return Subject.findOne({ name: value }).then((subjectDoc) => {
        if (subjectDoc) {
          return Promise.reject("Môn học đã tồn tại");
        }
      });
    }),
  body("passScore", "Điểm qua môn phải lớn hơn 5 và nhỏ hơn 10").isFloat({
    min: 5,
    max: 10,
  }),
];

router.post(
  "/subjects",
  isAuth,
  subjectAuthentication,
  subjectController.createSubject
);

router.put(
  "/subjects/:subjectId",
  isAuth,
  subjectAuthentication,
  subjectController.updateSubject
);

router.delete("/subject/:subjectId", isAuth, subjectController.deleteSubject);

module.exports = router;
