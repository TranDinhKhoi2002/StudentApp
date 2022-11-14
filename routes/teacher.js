const express = require("express");
const router = express.Router();

const isAuth = require("../middleware/is-auth");
const teacherController = require("../controllers/teacher");

router.get("/teachers", isAuth, teacherController.getTeachers);

module.exports = router;
