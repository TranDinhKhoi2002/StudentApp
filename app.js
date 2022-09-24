const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.json());

const adminRoutes = require("./routes/admin");
app.use("/admin", adminRoutes);

mongoose
  .connect(
    "mongodb+srv://studentapp:cPDyYQIXm3ZRLFqv@cluster0.9srxm.mongodb.net/studentapp?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
