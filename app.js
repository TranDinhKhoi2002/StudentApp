const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/student");
const subjectRoutes = require("./routes/subject");

app.use("/auth", authRoutes);
app.use("/student", studentRoutes);
app.use("/subject", subjectRoutes);

app.use((err, req, res, next) => {
  const { statusCode, message, data, validationErrors } = err;
  res.status(statusCode).json({ message, data, validationErrors });
});

mongoose
  .connect(
    "mongodb+srv://studentapp:cPDyYQIXm3ZRLFqv@cluster0.9srxm.mongodb.net/studentapp?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
