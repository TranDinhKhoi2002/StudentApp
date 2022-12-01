const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const Teacher = require("../models/teacher");
const isAuth = require("../middleware/is-auth");
const teacherController = require("../controllers/teacher");

const teacherValidation = [
  body("name", "Tên không được để trống").trim().notEmpty(),
  body("address", "Địa chỉ không được để trống").trim().notEmpty(),
  body("email")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .custom((value, { req }) => {
      return Teacher.findOne({ email: value }).then((teacherDoc) => {
        if (teacherDoc) {
          return Promise.reject("Email đã được sử dụng");
        }
      });
    })
    .normalizeEmail(),
  body("phone", "Số điện thoại không hợp lệ")
    .isMobilePhone("vi-VN")
    .custom((value, { req }) => {
      return Teacher.findOne({ phone: value }).then((teacherDoc) => {
        if (teacherDoc) {
          return Promise.reject("Số điện thoại đã được sử dụng");
        }
      });
    }),
  body("gender", "Giới tính không hợp lệ").isIn(["Nam", "Nữ"]),
  body("status", "Trạng thái không hợp lệ").isIn(["Đang dạy", "Đã nghỉ"]),
  body("birthday", "Ngày sinh không hợp lệ").isISO8601(),
];

router.get("/teachers", isAuth, teacherController.getTeachers);

router.put("/teachers/:teacherId", isAuth, teacherValidation, teacherController.updateTeacher);

module.exports = router;
