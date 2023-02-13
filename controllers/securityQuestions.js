const SecurityQuestions = require("../models/securityQuestions");
const SecurityAnswers = require("../models/securityAnswers");

exports.getQuestion = async (req, res, next) => {
  try {
    const questions = await SecurityQuestions.find().select("-__v");
    res.status(200).json({
      status: "success",
      data: questions,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyQuestionAnswer = async (req, res, next) => {
  try {
    const user_id = req.user._id;
    let { questionId, answer } = req.body;
    const question = await SecurityQuestions.find({
      _id: questionId,
    });
    if (question.length > 0) {
      const answers = await SecurityAnswers.find({
        user: user_id,
      });
      if (answers.length > 0) {
        let isVerified = false;
        for (var answerData of answers) {
          let arrayOfAns = answerData.answers;
          if (arrayOfAns.length > 0) {
            for (var answerSingle of arrayOfAns) {
              if (
                questionId == answerSingle.questionId &&
                answer.toLowerCase() == answerSingle.answer.toLowerCase()
              ) {
                isVerified = true;
                break;
              }
            }
          } else {
            res.status(400).json({
              status: "failed",
              message: "No answers found in records",
            });
          }
        }
        if (isVerified) {
          res.status(200).json({
            status: "success",
            data: { verified: isVerified },
          });
        } else {
          res.status(400).json({
            status: "failed",
            message: "Wrong answer",
          });
        }
      } else {
        res.status(400).json({
          status: "failed",
          message: "No answers added yet",
        });
      }
    } else {
      res.status(400).json({
        status: "failed",
        message: "Invalid question id provided",
      });
    }
  } catch (err) {
    next(err);
  }
};
