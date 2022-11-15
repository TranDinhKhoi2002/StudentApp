const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const Subject = require("../models/subject");
const Role = require("../models/role");
const isAuth = require("../middleware/is-auth");
const teacherController = require("../controllers/teacher");

const teacherValidation = [
  body("subject")
    .isMongoId()
    .withMessage("Môn học không hợp lệ")
    .custom((value, { req }) => {
      return Subject.findById(value).then((subjectDoc) => {
        if (!subjectDoc) {
          return Promise.reject("Môn học không tồn tại");
        }
      });
    }),
  body("role")
    .isMongoId()
    .withMessage("Vai trò không hợp lệ")
    .custom((value, { req }) => {
      return Role.findById(value).then((roleDoc) => {
        if (!roleDoc) {
          return Promise.reject("Vai trò không tồn tại");
        }
      });
    }),
];

router.get("/teachers", isAuth, teacherController.getTeachers);

module.exports = router;
