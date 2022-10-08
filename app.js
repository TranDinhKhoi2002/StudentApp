const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

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

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

app.use((err, req, res, next) => {
  const { statusCode, message, data } = err;
  res.status(statusCode).json({ message, data });
});

mongoose
  .connect(
    "mongodb+srv://studentapp:cPDyYQIXm3ZRLFqv@cluster0.9srxm.mongodb.net/studentapp?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
