const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const isAuth = require("../middleware/is-auth");
const classController = require("../controllers/class");

const Grade = require("../models/grade");
const Teacher = require("../models/teacher");

const classAuthentication = [
  body("grade")
    .isMongoId()
    .withMessage("Mã khối không hợp lệ")
    .custom((value, { req }) => {
      return Grade.findById(value).then((gradeDoc) => {
        if (!gradeDoc) {
          return Promise.reject("Khối không tồn tại");
        }
      });
    }),
  body("teacher")
    .isMongoId()
    .withMessage("Mã giáo viên không hợp lệ")
    .custom((value, { req }) => {
      return Teacher.findById(value).then((teacherDoc) => {
        if (!teacherDoc) {
          return Promise.reject("Giáo viên không tồn tại");
        }
      });
    }),
  body("name").not().isEmpty().withMessage("Tên lớp không được rỗng"),
  body("schoolYear").isNumeric().withMessage("Năm học phải là số"),
];

router.get("/classes", isAuth, classController.getClasses);

router.get("/classesByNameAndSchoolYear", isAuth, classController.getClassesByNameAndSchoolYear);

router.get("/classes/id/:classId", isAuth, classController.getClassById);

router.get("/classes/grade/:grade", isAuth, classController.getClassesByGrade);

router.get("/classes/name/:className", isAuth, classController.getClassesByName);

router.get("/classes/schoolYear/:schoolYear", isAuth, classController.getClassesBySchoolYear);

router.post("/classes", isAuth, classAuthentication, classController.createClass);

router.put("/classes/:classId", isAuth, classAuthentication, classController.updateClass);

router.delete("/classes/:classId", isAuth, classController.deleteClass);

module.exports = router;
