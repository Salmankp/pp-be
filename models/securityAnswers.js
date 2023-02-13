const mongoose = require("mongoose");

const securityAnswers = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    answers: {
      type: [
        {
          questionId: { type: mongoose.Types.ObjectId, ref: 'securityQuestions' , required: true },
          question: { type: String,required: true },
          answer: { type: String, required: true }
        }
      ],
      required: true
    }
  },
{ timestamps: true }
);

const SecurityAnswers = mongoose.model(
  "SecurityAnswers",
  securityAnswers
);
module.exports = SecurityAnswers;
