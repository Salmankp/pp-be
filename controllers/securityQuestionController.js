const SecurityQuestions = require("../models/securityQuestionModel");

exports.addQuestion = async (req, res, next) => {
  console.log(req.body);
  try {
    const update = await SecurityQuestions.findOneAndUpdate(
      { user: req.user.id },
      { $set: { user: req.user.id, questions: req.body.questions } },
      { upsert: true, new: true }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else next(new Error("Error Occured!"));
  } catch (err) {
    next(err);
  }
};

exports.getQuestion = async (req, res, next) => {
  try {
    const update = await SecurityQuestions.find({
      user: req.user.id
    });
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else
      res.status(404).json({
        status: "failed",
        message: "Security Questions Not Found"
      });
  } catch (err) {
    next(err);
  }
};
