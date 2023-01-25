const express = require("express");
const router = express.Router();

const isAuth = require("../middleware/is-auth");
const scheduleController = require("../controllers/schedule");

router.post("/schedule/class/:classId", isAuth, scheduleController.getClassSchedule);

router.post(
  "/schedule/teacher/:teacherId",
  isAuth,
  scheduleController.getTeacherSchedule
);

router.put("/add-lesson/:scheduleId", isAuth, scheduleController.addLesson);

router.put(
  "/update-lesson/:scheduleId",
  isAuth,
  scheduleController.updateLesson
);

router.put(
  "/delete-lesson/:scheduleId",
  isAuth,
  scheduleController.deleteLesson
);

module.exports = router;
