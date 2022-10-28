const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const staffController = require("../controllers/staff");
const isAuth = require("../middleware/is-auth");
const Account = require("../models/account");
const Role = require("../models/role");
const Staff = require("../models/staff")

router.get("/staffs", isAuth, staffController.getStaffs);

router.get("/staffs/:staffId", isAuth, staffController.getStaff);

const staffAuthentication = [
  body("role")
    .isMongoId()
    .withMessage("Mã vai trò không hợp lệ")
    .custom((value, { req }) => {
      return Role.findById(value).then((roleDoc) => {
        if (
          !roleDoc ||
          roleDoc.name !== "Nhân viên giáo vụ"
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
      return Staff.findOne({ email: value }).then((staffDoc) => {
        if (staffDoc) {
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
  "/staffs",
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
    ...staffAuthentication,
  ],
  staffController.createStaff
);

router.post(
  "/staffs/:staffId",
  isAuth,
  staffAuthentication,
  staffController.updateStaff
);

router.delete("/staffs/:staffId", isAuth, staffController.deleteStaff);

module.exports = router;
