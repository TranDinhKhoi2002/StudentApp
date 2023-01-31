const express = require("express");
const router = express.Router();

const isAuth = require("../middleware/is-auth");
const dashboardController = require("../controllers/dashboard");

router.get("/statistics", isAuth, dashboardController.getStatistics);
router.post("/statisticsByYear", isAuth, dashboardController.getStatisticsByYear);

module.exports = router;