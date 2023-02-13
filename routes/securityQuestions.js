const express = require("express");
const router = express.Router();
const securityQuestions = require("../controllers/securityQuestions");
const middleware = require("../middlewares/auth");

// Protect all routes after this middleware
router.use(middleware.protect);

router.get("/", securityQuestions.getQuestion);
router.post("/verifyQuestionAnswer", securityQuestions.verifyQuestionAnswer);

module.exports = router;
