const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const teacherController = require("../controllers/teacher");
const isAuth = require("../middleware/is-auth");
const Account = require("../models/account");
const Role = require("../models/role");
const Subject = require("../models/subject");
const Teacher = require("../models/teacher");

router.get("/teachers", isAuth, teacherController.getTeachers);

router.get("/teachers/:teacherId", isAuth, teacherController.getTeacher);

const teacherAuthentication = [
  body("subject")
    .isMongoId()
    .withMessage("Mã môn học không hợp lệ")
    .custom((value, { req }) => {
      return Subject.findById(value).then((subjectDoc) => {
        if (!subjectDoc) {
          return Promise.reject("Môn học không tồn tại");
        }
      });
    }),
  body("role")
    .isMongoId()
    .withMessage("Mã vai trò không hợp lệ")
    .custom((value, { req }) => {
      return Role.findById(value).then((roleDoc) => {
        if (
          !roleDoc ||
          roleDoc.name !== "Giáo viên chủ nhiệm" ||
          roleDoc.name !== "Giáo viên bộ môn"
        ) {
          return Promise.reject("Vai trò không hợp lệ");
        }
      });
    }),
  body("name", "Tên không được để trống").trim().notEmpty(),
  body("address", "Địa chỉ không được để trống").trim().notEmpty(),
  body("email")
    .isEmail()
    .withMessage("Email không hợp lệ")
    .custom((value, { req }) => {
      return Teacher.findOne({ email: value }).then((teacherDoc) => {
        if (teacherDoc) {
          return Promise.reject("Email đã tồn tại, vui lòng chọn email khác");
        }
      });
    })
    .normalizeEmail(),
  body("phone", "Số điện thoại không hợp lệ").isMobilePhone("vi-VN"),
  body("gender", "Giới tính không hợp lệ").custom((value, { req }) => {
    if (value !== "Nam" || value !== "Nữ") {
      return false;
    }
    return true;
  }),
  body("birthday", "Ngày sinh không hợp lệ").isDate(),
];

router.post(
  "/teachers",
  isAuth,
  [
    body("username")
      .trim()
      .notEmpty()
      .withMessage("Tên đăng nhập không được để trống")
      .custom((value, { req }) => {
        return Account.findOne({ username: value }).then((accountDoc) => {
          if (accountDoc) {
            return Promise.reject("Tên đăng nhập đã tồn tại");
          }
        });
      }),
    body("password", "Mật khẩu không được để trống").trim().notEmpty(),
    ...teacherAuthentication,
  ],
  teacherController.createTeacher
);

router.put(
  "/teachers/:teacherId",
  isAuth,
  teacherAuthentication,
  teacherController.updateTeacher
);

router.delete("/teachers/:teacherId", isAuth, teacherController.deleteTeacher);

module.exports = router;
