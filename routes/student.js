const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const studentController = require("../controllers/student");
const isAuth = require("../middleware/is-auth");

const Student = require("../models/student");

const studentValidation = [
  body("className").isMongoId().withMessage("Lớp không hợp lệ"),
  body("name", "Tên không được để trống").notEmpty().trim(),
  body("gender", "Giới tính không hợp lệ").isIn(["Nam", "Nữ"]),
  body("birthday", "Ngày sinh không hợp lệ").isISO8601(),
  body("address", "Địa chỉ không được để trống").notEmpty().trim(),
  body("email")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .custom((value, { req }) => {
      return Student.findOne({ email: value }).then((studentDoc) => {
        if (studentDoc) {
          return Promise.reject("Email đã được sử dụng");
        }
      });
    })
    .normalizeEmail(),
  body("phone", "Số điện thoại không hợp lệ")
    .isMobilePhone("vi-VN")
    .custom((value, { req }) => {
      return Student.findOne({ phone: value }).then((studentDoc) => {
        if (studentDoc) {
          return Promise.reject("Số điện thoại đã được sử dụng");
        }
      });
    }),
];

router.get("/students", isAuth, studentController.getAllStudents);

router.get("/students/:classId", isAuth, studentController.getStudentsByClassId);

router.get("/students/:studentId", isAuth, studentController.getStudent);

router.post("/students", isAuth, studentValidation, studentController.createStudent);

router.put("/students/:studentId", isAuth, studentValidation, studentController.updateStudent);

router.delete("/students/:studentId", isAuth, studentController.deleteStudent);

module.exports = router;
