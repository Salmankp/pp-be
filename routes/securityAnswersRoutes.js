const express = require("express");
const router = express.Router();
const securityAnswers = require("../controllers/securityAnswersController");
const middleware = require("../middlewares/auth");

// Protect all routes after this middleware
router.use(middleware.protect);

router.route('/').get(securityAnswers.getAnswers).post(securityAnswers.addAnswers);


module.exports = router;
