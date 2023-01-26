const Teacher = require("../models/teacher");
const Subject = require("../models/subject");
const Schedule = require("../models/schedule");

const { checkStaffAndPrincipalRole, getRole } = require("../util/roles");
const teacher = require("../models/teacher");

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
  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized && teacherId != req.accountId) {
      const error = new Error(
        "Chỉ có nhân viên giáo vụ, hiệu trưởng mới được xem khóa biểu"
      );
      error.statusCode = 401;
      return next(error);
    }
    let _schedule = await Schedule.findOne({
      teacher: teacherId,
      schoolYear: schoolYear,
      semester: semesterId,
    });
    if(!_schedule){
      _schedule = new Schedule({
        teacher: teacherId,
        schoolYear: schoolYear,
        semester: semesterId,
      });
      await _schedule.save();
    }
    res.status(200).json({
      _schedule,
    });
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
      const error = new Error(
        "Chỉ có nhân viên giáo vụ hoặc hiệu trưởng mới được sửa thời khóa biểu"
      );
      error.statusCode = 401;
      return next(error);
    }
    const updatedSchedule = await Schedule.findById(scheduleId).populate(
      "class",
      "name"
    );
    
    let teacherSchedule = await Schedule.findOne({
      teacher: teacherId,
      schoolYear: updatedSchedule.schoolYear,
      semester: updatedSchedule.semester,
    });
    if(!teacherSchedule){
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
    updatedSchedule.markModified('lessons');
    teacherSchedule.markModified('lessons');
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
  const { subjectId, teacherId, dayOfWeek, period } = req.body;
  const scheduleId = req.params.scheduleId;
  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error(
        "Chỉ có nhân viên giáo vụ hoặc hiệu trưởng mới được sửa thời khóa biểu"
      );
      error.statusCode = 401;
      return next(error);
    }
    const updatedSchedule = await Schedule.findById(scheduleId).populate(
      "class",
      "name"
    );
    const prevTeacherSchedule = await Schedule.findOne({
      teacher: updatedSchedule.lessons[period - 1][dayOfWeek].teacherId,
      schoolYear: updatedSchedule.schoolYear,
      semester: updatedSchedule.semester,
    });
    const chosenSubject = await Subject.findById(subjectId);
    const chosenTeacher = await Teacher.findById(teacherId);
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
    prevTeacherSchedule.lessons[period - 1][dayOfWeek] = null;
    updatedSchedule.lessons[period - 1][dayOfWeek] = {
      subjectId: chosenSubject._id,
      teacherId: chosenTeacher._id,
      subject: chosenSubject.name,
      teacher: chosenTeacher.name,
    };
    teacherSchedule.lessons[period - 1][dayOfWeek] = {
      classId: updatedSchedule.class._id,
      className: updatedSchedule.class.name,
    };
    updatedSchedule.markModified('lessons');
    prevTeacherSchedule.markModified('lessons');
    teacherSchedule.markModified('lessons');
    await updatedSchedule.save();
    await prevTeacherSchedule.save();
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

exports.deleteLesson = async (req, res, next) => {
  const { dayOfWeek, period } = req.body;
  const scheduleId = req.params.scheduleId;
  try {
    const isAuthorized = await checkStaffAndPrincipalRole(req.accountId);
    if (!isAuthorized) {
      const error = new Error(
        "Chỉ có nhân viên giáo vụ hoặc hiệu trưởng mới được sửa thời khóa biểu"
      );
      error.statusCode = 401;
      return next(error);
    }
    const updatedSchedule = await Schedule.findById(scheduleId);
    const prevTeacherSchedule = await Schedule.findOne({
      teacher: updatedSchedule.lessons[period - 1][dayOfWeek].teacherId,
      schoolYear: updatedSchedule.schoolYear,
      semester: updatedSchedule.semester,
    });
    prevTeacherSchedule.lessons[period - 1][dayOfWeek] = null;
    updatedSchedule.lessons[period - 1][dayOfWeek] = null;
    prevTeacherSchedule.markModified('lessons');
    updatedSchedule.markModified('lessons');
    await prevTeacherSchedule.save();
    await updatedSchedule.save();
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
