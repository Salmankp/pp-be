const SecurityAnswers = require("../models/securityAnswers");

exports.addAnswers = async (req, res, next) => {
  try {
    const answer = await SecurityAnswers.findOne({ user: req.user._id });
    if (answer) {
      const updated_answers = await SecurityAnswers.findByIdAndUpdate(answer._id, { answers: req?.body.answers });
      return res.status(200).json({
        status: "success",
        data: updated_answers
      });
    }
    const add_answers = await SecurityAnswers.create({user: req.user.id, answers: req?.body.answers });
    return res.status(200).json({
      status: "success",
      data: add_answers
    });

  } catch (err) {
    next(err);
  }
};

exports.getAnswers = async (req, res, next) => {
  try {
    const answers = await SecurityAnswers.findOne({
      user: req.user._id
    });
    if (answers) {
     return res.status(200).json({
        status: "success",
        data: answers
      });
    } else
      res.status(404).json({
        status: "failed",
        message: "Security Answers Not Found"
      });
  } catch (err) {
    next(err);
  }
};
