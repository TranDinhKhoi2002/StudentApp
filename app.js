const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.status(200).json({ message: "Test successfully" });
});

app.listen(3000);
