const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const Staff = require("../models/staff");
const Teacher = require("../models/teacher");
const isAuth = require("../middleware/is-auth");
const staffController = require("../controllers/staff");

router.get("/staffs", isAuth, staffController.getStaffs);

router.post(
  "/staffs",
  isAuth,
  [
    body("name", "Tên không được để trống").trim().notEmpty(),
    body("address", "Địa chỉ không được để trống").trim().notEmpty(),
    body("email")
      .isEmail()
      .withMessage("Email không hợp lệ")
      .custom(async (value, { req }) => {
        const staffDoc = await Staff.findOne({ email: value });
        if (staffDoc) {
          return Promise.reject("Email đã được sử dụng");
        }

        const teacherDoc = await Teacher.findOne({ email: value });
        if (teacherDoc) {
          return Promise.reject("Email đã được sử dụng");
        }
      })
      .normalizeEmail(),
    body("phone", "Số điện thoại không hợp lệ")
      .isMobilePhone("vi-VN")
      .custom(async (value, { req }) => {
        const staffDoc = await Staff.findOne({ email: value });
        if (staffDoc) {
          return Promise.reject("Số điện thoại đã được sử dụng");
        }

        const teacherDoc = await Teacher.findOne({ phone: value });
        if (teacherDoc) {
          return Promise.reject("Số điện thoại đã được sử dụng");
        }
      }),
    body("gender", "Giới tính không hợp lệ").isIn(["Nam", "Nữ"]),
    body("status", "Trạng thái không hợp lệ").isIn(["Đang làm", "Đã nghỉ"]),
    body("birthday", "Ngày sinh không hợp lệ").isISO8601(),
  ],
  staffController.createStaff
);

router.put(
  "/staffs/:staffId",
  isAuth,
  [
    body("name", "Tên không được để trống").notEmpty().trim(),
    body("address", "Địa chỉ không được để trống").trim().notEmpty(),
    body("email").isEmail().withMessage("Email không hợp lệ").normalizeEmail(),
    body("phone", "Số điện thoại không hợp lệ").isMobilePhone("vi-VN"),
    body("gender", "Giới tính không hợp lệ").isIn(["Nam", "Nữ"]),
    body("status", "Trạng thái không hợp lệ").isIn(["Đang làm", "Đã nghỉ"]),
    body("birthday", "Ngày sinh không hợp lệ").isISO8601(),
  ],
  staffController.updateStaff
);

router.delete("/staffs/:staffId", isAuth, staffController.deleteStaff);

module.exports = router;
