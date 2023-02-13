const mongoose = require("mongoose");

const securityQuestions = new mongoose.Schema(
    {
        Questions: {
            type: String, required: true
        }
    }
);

const SecurityQuestions = mongoose.model(
    "components_security_question_questions",
    securityQuestions
);
module.exports = SecurityQuestions;
