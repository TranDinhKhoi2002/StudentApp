const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const studentController = require("../controllers/student");
const isAuth = require("../middleware/is-auth");

const Student = require("../models/student");

router.get("/students/:classId", isAuth, studentController.getStudents);

router.get("/students/:studentId", isAuth, studentController.getStudent);

router.post(
  "/students",
  isAuth,
  [
    body("className").isMongoId().withMessage("Lớp không hợp lệ"),
    body("name", "Tên không được để trống").notEmpty().trim(),
    body("gender", "Giới tính không hợp lệ").custom((value, { req }) => {
      if (value !== "Nam" || value !== "Nữ") {
        return false;
      }
      return true;
    }),
    body("birthday", "Ngày sinh không hợp lệ").isDate(),
    body("address", "Địa chỉ không được để trống").notEmpty().trim(),
    body("email")
      .isEmail()
      .withMessage("Email không hợp lệ")
      .custom((value, { req }) => {
        return Student.findOne({ email: value }).then((studentDoc) => {
          if (studentDoc) {
            return Promise.reject("Email đã tồn tại, vui lòng chọn email khác");
          }
        });
      })
      .normalizeEmail(),
    body("phone", "Số điện thoại không hợp lệ").isMobilePhone("vi-VN"),
  ],
  studentController.createStudent
);

router.put(
  "/students/:studentId",
  isAuth,
  [
    body("className").isMongoId().withMessage("Lớp không hợp lệ"),
    body("name", "Tên không được để trống").notEmpty().trim(),
    body("gender", "Giới tính không hợp lệ").custom((value, { req }) => {
      if (value !== "Nam" || value !== "Nữ") {
        return false;
      }
      return true;
    }),
    body("birthday", "Ngày sinh không hợp lệ").isDate(),
    body("address", "Địa chỉ không được để trống").notEmpty().trim(),
    body("email")
      .isEmail()
      .withMessage("Email không hợp lệ")
      .custom((value, { req }) => {
        return Student.findOne({ email: value }).then((studentDoc) => {
          if (studentDoc) {
            return Promise.reject("Email đã tồn tại, vui lòng chọn email khác");
          }
        });
      })
      .normalizeEmail(),
    body("phone", "Số điện thoại không hợp lệ").isMobilePhone("vi-VN"),
  ],
  studentController.updateStudent
);

router.delete("/students/:studentId", isAuth, studentController.deleteStudent);

module.exports = router;
