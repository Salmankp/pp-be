const BankAccount = require("../models/bankAccountModel");

exports.addAccuont = async (req, res, next) => {
  console.log(req.body.values);
  try {
    const update = await BankAccount.create(req.body.values);
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

exports.getAccount = async (req, res, next) => {
  try {
    const update = await BankAccount.find({
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
        message: "Bank Account Not Found"
      });
  } catch (err) {
    next(err);
  }
};
exports.getAccountById = async (req, res, next) => {
  try {
    const update = await BankAccount.findById(req.params.id);
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else
      res.status(404).json({
        status: "failed",
        message: "Bank Account Not Found"
      });
  } catch (err) {
    next(err);
  }
};
