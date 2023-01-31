const Teacher = require("../models/teacher");
const Subject = require("../models/subject");
const Schedule = require("../models/schedule");

const { checkStaffAndPrincipalRole, getRole } = require("../util/roles");

exports.getClassSchedule = async (req, res, next) => {
  const { semesterId } = req.body;
  const classId = req.params.classId;
  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    const roleName = await getRole(req.accountId);
    if (!isAuthorized && roleName != "Giáo viên chủ nhiệm") {
      const error = new Error(
        "Chỉ có nhân viên giáo vụ, hiệu trưởng hoặc giáo viên chủ nhiệm mới được xem khóa biểu lớp"
      );
      error.statusCode = 401;
      return next(error);
    }
    const _schedule = await Schedule.findOne({
      class: classId,
      semester: semesterId,
    });
    if (!_schedule) {
      const error = new Error("Không tìm thấy thời khóa biểu");
      error.statusCode = 404;
      return next(error);
    }
    res.status(200).json({
      schedule: _schedule,
    });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.getTeacherSchedule = async (req, res, next) => {
  const { schoolYear, semesterId } = req.body;
  const teacherId = req.params.teacherId;
  const teacherAccount = await Teacher.findById(teacherId);
  try {
    if (teacherAccount.account != req.accountId) {
      const error = new Error("Tài khoản không có quyền truy cập");
      error.statusCode = 401;
      return next(error);
    }

    let _schedule = await Schedule.findOne({
      teacher: teacherId,
      schoolYear: schoolYear,
      semester: semesterId,
    });
    if (!_schedule) {
      _schedule = new Schedule({
        teacher: teacherId,
        schoolYear: schoolYear,
        semester: semesterId,
      });
      await _schedule.save();
    }

    res.status(200).json({ schedule: _schedule });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.addLesson = async (req, res, next) => {
  const { subjectId, teacherId, dayOfWeek, startPeriod, endPeriod } = req.body;
  const scheduleId = req.params.scheduleId;
  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có nhân viên giáo vụ hoặc hiệu trưởng mới được sửa thời khóa biểu");
      error.statusCode = 401;
      return next(error);
    }
    const updatedSchedule = await Schedule.findById(scheduleId).populate("class", "name");

    let teacherSchedule = await Schedule.findOne({
      teacher: teacherId,
      schoolYear: updatedSchedule.schoolYear,
      semester: updatedSchedule.semester,
    });
    if (!teacherSchedule) {
      teacherSchedule = new Schedule({
        teacher: teacherId,
        schoolYear: updatedSchedule.schoolYear,
        semester: updatedSchedule.semester,
      });
      await teacherSchedule.save();
    }
    const chosenSubject = await Subject.findById(subjectId);
    const chosenTeacher = await Teacher.findById(teacherId);
    for (let i = startPeriod - 1; i < endPeriod; i++) {
      if (updatedSchedule.lessons[i][dayOfWeek] != null) {
        const error = new Error("Tiết học đã tồn tại");
        error.statusCode = 401;
        return next(error);
      }
    }
    for (let i = startPeriod - 1; i < endPeriod; i++) {
      updatedSchedule.lessons[i][dayOfWeek] = {
        subjectId: chosenSubject._id,
        teacherId: chosenTeacher._id,
        subject: chosenSubject.name,
        teacher: chosenTeacher.name,
      };
      teacherSchedule.lessons[i][dayOfWeek] = {
        classId: updatedSchedule.class._id,
        className: updatedSchedule.class.name,
      };
    }
    if(!chosenTeacher.classes.includes(updatedSchedule.class._id)){
      chosenTeacher.classes.push(updatedSchedule.class._id);
      await chosenTeacher.save();
    }
    updatedSchedule.markModified("lessons");
    teacherSchedule.markModified("lessons");
    await updatedSchedule.save();
    await teacherSchedule.save();
    res.status(201).json({
      message: "Cập nhật thời khóa biểu thành công",
      schedule: updatedSchedule,
    });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.updateLesson = async (req, res, next) => {
  const { subjectId, teacherId, dayOfWeek, prevStartPeriod, prevEndPeriod, startPeriod, endPeriod } = req.body;
  const scheduleId = req.params.scheduleId;
  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có nhân viên giáo vụ hoặc hiệu trưởng mới được sửa thời khóa biểu");
      error.statusCode = 401;
      return next(error);
    }
    const updatedSchedule = await Schedule.findById(scheduleId).populate("class", "name");
    const chosenTeacher = await Teacher.findById(teacherId);
    var isValid = true;
    // check if there is any other lesson
    for (let i = startPeriod - 1; i < endPeriod; i++) {
      if (i >= prevStartPeriod - 1 && i < prevEndPeriod) {
        continue;
      }
      if (
        updatedSchedule.lessons[i][dayOfWeek] != null &&
        updatedSchedule.lessons[i][dayOfWeek].teacherId != chosenTeacher._id
      ) {
        isValid = false;
        break;
      }
    }
    if (!isValid) {
      const error = new Error("Tiết học đã tồn tại");
      error.statusCode = 401;
      return next(error);
    }
    // delete previous lessons
    const prevTeacherSchedule = await Schedule.findOne({
      teacher: updatedSchedule.lessons[prevStartPeriod - 1][dayOfWeek].teacherId,
      schoolYear: updatedSchedule.schoolYear,
      semester: updatedSchedule.semester,
    });
    for (let i = prevStartPeriod - 1; i < prevEndPeriod; i++) {
      updatedSchedule.lessons[i][dayOfWeek] = null;
      prevTeacherSchedule.lessons[i][dayOfWeek] = null;
    }
    prevTeacherSchedule.markModified("lessons");
    await prevTeacherSchedule.save();
    // add new lessons
    const chosenSubject = await Subject.findById(subjectId);
    let teacherSchedule = await Schedule.findOne({
      teacher: teacherId,
      schoolYear: updatedSchedule.schoolYear,
      semester: updatedSchedule.semester,
    });
    if (!teacherSchedule) {
      teacherSchedule = new Schedule({
        teacher: teacherId,
        schoolYear: updatedSchedule.schoolYear,
        semester: updatedSchedule.semester,
      });
      await teacherSchedule.save();
    }
    for (let i = startPeriod - 1; i < endPeriod; i++) {
      updatedSchedule.lessons[i][dayOfWeek] = {
        subjectId: chosenSubject._id,
        teacherId: chosenTeacher._id,
        subject: chosenSubject.name,
        teacher: chosenTeacher.name,
      };
      teacherSchedule.lessons[i][dayOfWeek] = {
        classId: updatedSchedule.class._id,
        className: updatedSchedule.class.name,
      };
    }
    updatedSchedule.markModified("lessons");
    await updatedSchedule.save();
    teacherSchedule.markModified("lessons");
    await teacherSchedule.save();
    if (!prevTeacherSchedule._id.equals(teacherSchedule._id)) {
      if (!chosenTeacher.classes.includes(updatedSchedule.class._id)) {
        chosenTeacher.classes.push(updatedSchedule.class._id);
        await chosenTeacher.save();
      }
      var isTeaching = false;
      for(let period of updatedSchedule.lessons){
        for(let day of period){
          if(day!=null && day.teacherId == prevTeacherSchedule.teacher){
            isTeaching = true;
            break;
          }
        }
        if(isTeaching) break;
      }
      if(!isTeaching){
        const prevTeacher = await Teacher.findById(prevTeacherSchedule.teacher);
        prevTeacher.classes.pull(updatedSchedule.class._id);
        await prevTeacher.save();
      }
    }
    res.status(201).json({
      message: "Cập nhật thời khóa biểu thành công",
      schedule: updatedSchedule,
    });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.deleteLesson = async (req, res, next) => {
  const { dayOfWeek, startPeriod, endPeriod } = req.body;
  const scheduleId = req.params.scheduleId;
  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error("Chỉ có nhân viên giáo vụ hoặc hiệu trưởng mới được sửa thời khóa biểu");
      error.statusCode = 401;
      return next(error);
    }
    const updatedSchedule = await Schedule.findById(scheduleId);
    const prevTeacherSchedule = await Schedule.findOne({
      teacher: updatedSchedule.lessons[startPeriod - 1][dayOfWeek].teacherId,
      schoolYear: updatedSchedule.schoolYear,
      semester: updatedSchedule.semester,
    });
    for (let i = startPeriod - 1; i < endPeriod; i++) {
      prevTeacherSchedule.lessons[i][dayOfWeek] = null;
      updatedSchedule.lessons[i][dayOfWeek] = null;
    }
    prevTeacherSchedule.markModified("lessons");
    updatedSchedule.markModified("lessons");
    await prevTeacherSchedule.save();
    await updatedSchedule.save();
    var isTeaching = false;
    for (let period of updatedSchedule.lessons) {
      for (let day of period) {
        if (day != null && day.teacherId == prevTeacherSchedule.teacher) {
          isTeaching = true;
          break;
        }
      }
      if (isTeaching) break;
    }
    if (!isTeaching) {
      const prevTeacher = await Teacher.findById(prevTeacherSchedule.teacher);
      prevTeacher.classes.pull(updatedSchedule.class._id);
      await prevTeacher.save();
    }
    res.status(201).json({
      message: "Cập nhật thời khóa biểu thành công",
      schedule: updatedSchedule,
    });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};

exports.createSchedule = async (req, res, next) => {
  const { classId, semesterId } = req.body;

  try {
    const schedule = new Schedule({
      class: classId,
      semester: semesterId,
      schoolYear: new Date().getFullYear(),
    });
    await schedule.save();

    res.status(201).json({ schedule });
  } catch (err) {
    const error = new Error(err.message);
    error.statusCode = 500;
    next(error);
  }
};
