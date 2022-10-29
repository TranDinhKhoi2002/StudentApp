const express = require("express");
const router = express.Router();

const dataController = require("../controllers/data");
const isAuth = require("../middleware/is-auth");

router.get("/data", dataController.getData);

module.exports = router;
