exports.getAverageScoresInSemester = (classScores) => {
  const studentScoresInFirstSemester = [];
  let i = 0;
  while (i < classScores[0].studentScores.length) {
    for (const classScore of classScores) {
      studentScoresInFirstSemester.push({
        student: classScore.studentScores[i].student,
        subject: classScore.subject,
        average: classScore.studentScores[i].scores.average,
      });
    }
    i++;
  }

  const studentScoresAverageInFirstSemester = [];
  let totalAverageSubject = 0;
  for (let index = 0; index < studentScoresInFirstSemester.length; index++) {
    const currentScore = studentScoresInFirstSemester[index];

    if (
      (index !== 0 && currentScore.student.toString() !== studentScoresInFirstSemester[index - 1].student.toString()) ||
      index === studentScoresInFirstSemester.length - 1
    ) {
      studentScoresAverageInFirstSemester.push({
        student: studentScoresInFirstSemester[index - 1].student,
        average: (totalAverageSubject / 10).toFixed(2),
      });
      totalAverageSubject = currentScore.average;
    } else {
      totalAverageSubject += currentScore.average;
    }
  }

  return studentScoresAverageInFirstSemester;
};
