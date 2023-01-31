const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const regulationsController = require("../controllers/regulation");
const isAuth = require("../middleware/is-auth");

const regulationValidation = [
  body("name").notEmpty().withMessage("Tên không được rỗng"),
  body("min").isNumeric().withMessage("Giá trị tối thiểu phải là số"),
  body("max")
    .isNumeric()
    .withMessage("Giá trị tối đa phải là số")
    .custom((value, { req }) => {
      // console.log(+req.body.min, +value);
      // console.log(+req.body.min > +value);
      console.log("here");
      if (+req.body.min > +value) {
        return Promise.reject("Giá trị tối thiểu phải nhỏ hơn hoặc bằng giá trị tối đa");
      }
      return true;
    }),
];

router.get("/regulations", isAuth, regulationsController.getRegulations);

router.post("/regulations", isAuth, regulationValidation, regulationsController.createRegulations);

router.put("/regulations/:regulationId", isAuth, regulationValidation, regulationsController.updateRegulation);

module.exports = router;
