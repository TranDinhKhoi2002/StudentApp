const path = require("path");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

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

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, uuidv4() + "-" + file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/jpg" ||
//     file.mimetype === "image/jpeg"
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/student");
const classRoutes = require("./routes/class");
const scoreRoutes = require("./routes/score");

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
// const privateKey = fs.readFileSync("server.key");
// const certificate = fs.readFileSync("server.cert");

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use("/auth", authRoutes);
app.use(studentRoutes);
app.use(classRoutes);
app.use(scoreRoutes);

app.use((err, req, res, next) => {
  const { statusCode, message, data, validationErrors } = err;
  res.status(statusCode).json({ message, data, validationErrors });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.9srxm.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`
  )
  .then((result) => {
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);

    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => console.log(err));
