const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const isAuth = require("../middleware/is-auth");
const profileController = require("../controllers/profile");

router.put(
  "/profile",
  isAuth,
  [
    body("name", "Tên không được để trống").notEmpty().trim(),
    body("address", "Địa chỉ không được để trống").trim().notEmpty(),
    body("email").isEmail().withMessage("Email không hợp lệ").normalizeEmail(),
    body("phone", "Số điện thoại không hợp lệ").isMobilePhone("vi-VN"),
    body("gender", "Giới tính không hợp lệ").isIn(["Nam", "Nữ"]),
    body("birthday", "Ngày sinh không hợp lệ").isISO8601(),
  ],
  profileController.updateProfile
);

module.exports = router;
