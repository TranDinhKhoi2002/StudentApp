const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin");

router.post("/account", adminController.createAccount);

module.exports = router;
