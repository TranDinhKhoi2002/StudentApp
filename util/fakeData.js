const { faker } = require("@faker-js/faker");
const bcryptjs = require("bcryptjs");
const { sample, sum } = require("lodash");

const Account = require("../models/account");
const ClassScore = require("../models/classScore");
const StudentScore = require("../models/studentScore");
const Grade = require("../models/grade");
const Semester = require("../models/semester");
const Subject = require("../models/subject");
const Role = require("../models/role");
const Teacher = require("../models/teacher");
const Class = require("../models/class");
const Student = require("../models/student");
const Staff = require("../models/staff");

exports.generateFakeData = async () => {
  const grades = [];
  for (let i = 10; i < 13; i++) {
    const grade = new Grade({
      name: i,
      _id: faker.database.mongodbObjectId(),
    });
    grades.push(grade);
    await grade.save();
  }

  const semesters = [];
  for (let i = 1; i < 3; i++) {
    const semester = new Semester({
      name: `Học kỳ ${i}`,
      _id: faker.database.mongodbObjectId(),
    });
    semesters.push(semester);
    await semester.save();
  }

  const roles = [];
  ["Hiệu trưởng", "Giáo viên bộ môn", "Giáo viên chủ nhiệm", "Nhân viên giáo vụ"].forEach(async (roleName) => {
    const role = new Role({
      name: roleName,
      _id: faker.database.mongodbObjectId(),
    });
    roles.push(role);
    await role.save();
  });

  const subjects = [];
  ["Toán", "Lý", "Hóa", "Sinh", "Văn", "Tiếng Anh", "Sử", "Địa", "GDCD", "Tin học"].forEach(async (subjectName) => {
    const subject = new Subject({
      name: subjectName,
      passScore: 5,
      teachers: [],
    });
    subjects.push(subject);
    await subject.save();
  });

  for (let i = 0; i < 2; i++) {
    const account = new Account({
      username: faker.internet.userName(),
      password: bcryptjs.hashSync("111111", 12),
    });
    await account.save();

    const staff = new Staff({
      role: roles[3]._id,
      account: account._id,
      name: faker.name.fullName(),
      address: faker.address.street() + " " + faker.address.city(),
      email: faker.internet.email(),
      phone: faker.phone.number("03########"),
      gender: sample(["Nam", "Nữ"]),
      birthday: faker.date.birthdate({ min: 1970, max: 1997, mode: "year" }),
    });
    await staff.save();
  }

  for (let i = 0; i < 2; i++) {
    const account = new Account({
      username: faker.internet.userName(),
      password: bcryptjs.hashSync("111111", 12),
    });
    await account.save();

    const teacher = new Teacher({
      subject: subjects[faker.datatype.number({ min: 0, max: 9 })]._id,
      role: roles[faker.datatype.number({ min: 0, max: 3 })]._id,
      account: account._id,
      classes: [],
      name: faker.name.fullName(),
      address: faker.address.street() + " " + faker.address.city(),
      email: faker.internet.email(),
      phone: faker.phone.number("03########"),
      gender: sample(["Nam", "Nữ"]),
      birthday: faker.date.birthdate({ min: 1970, max: 1997, mode: "year" }),
    });
    await teacher.save();
  }

  for (let i = 0; i < 2; i++) {
    const account = new Account({
      username: faker.internet.userName(),
      password: bcryptjs.hashSync("111111", 12),
    });
    await account.save();

    const classId = faker.database.mongodbObjectId();

    const teacher = new Teacher({
      subject: subjects[faker.datatype.number({ min: 0, max: 9 })]._id,
      role: roles[faker.datatype.number({ min: 0, max: 3 })]._id,
      account: account._id,
      classes: [classId],
      name: faker.name.fullName(),
      address: faker.address.street() + " " + faker.address.city(),
      email: faker.internet.email(),
      phone: faker.phone.number("03########"),
      gender: sample(["Nam", "Nữ"]),
      birthday: faker.date.birthdate({ min: 1970, max: 1997, mode: "year" }),
    });
    await teacher.save();

    const studentIds = [...Array(5)].map((_) => faker.database.mongodbObjectId());

    studentIds.forEach(async (id) => {
      const student = new Student({
        className: classId,
        name: faker.name.fullName(),
        gender: sample(["Nam", "Nữ"]),
        birthday: faker.date.birthdate({ min: 16, max: 18, mode: "age" }),
        address: faker.address.street() + " " + faker.address.city(),
        email: faker.internet.email(),
        phone: faker.phone.number("03########"),
        status: "Đang học",
        _id: id,
      });
      await student.save();
    });

    const grade = grades[faker.datatype.number({ min: 0, max: 2 })];
    const schoolYear = faker.datatype.number({
      min: 2015,
      max: new Date().getFullYear(),
    });
    const _class = new Class({
      grade: grade._id,
      teacher: teacher._id,
      name: grade.name + "A" + faker.datatype.number({ min: 1, max: 8 }),
      schoolYear: schoolYear,
      semester: semesters[faker.datatype.number({ min: 0, max: 1 })],
      students: studentIds,
      _id: classId,
    });
    await _class.save();

    [...Array(20)].forEach(async (_, index) => {
      let semesterId = semesters[0]._id;
      if (index >= 10) {
        semesterId = semesters[1]._id;
      }

      const classScore = new ClassScore({
        class: _class._id,
        subject: index >= 10 ? subjects[index - 10]._id : subjects[index]._id,
        semester: semesterId,
        schoolYear: schoolYear,
        studentScores: [],
      });
      await classScore.save();

      const studentScoreIds = [];
      studentIds.forEach(async (id) => {
        const studentScore = new StudentScore({
          student: id,
          classScore: classScore._id,
          scores: {
            oral: [...Array(5)].map((_) => faker.datatype.float({ min: 0, max: 10, precision: 0.25 })),
            m15: [...Array(5)].map((_) => faker.datatype.float({ min: 0, max: 10, precision: 0.25 })),
            m45: [...Array(3)].map((_) => faker.datatype.float({ min: 0, max: 10, precision: 0.25 })),
            final: faker.datatype.float({ min: 0, max: 10, precision: 0.25 }),
          },
        });
        studentScoreIds.push(studentScore._id);
        await studentScore.save();
      });

      classScore.studentScores = studentScoreIds;
      await classScore.save();
    });
  }
};

exports.removeAllData = async () => {
  await Account.deleteMany();
  await Class.deleteMany();
  await ClassScore.deleteMany();
  await Grade.deleteMany();
  await Role.deleteMany();
  await Semester.deleteMany();
  await Staff.deleteMany();
  await Student.deleteMany();
  await StudentScore.deleteMany();
  await Subject.deleteMany();
  await Teacher.deleteMany();
};
