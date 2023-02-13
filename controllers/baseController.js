const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const { User } = require("../models/userModel");
const Wallet = require("../models/walletModel");
const offer = require("../models/offerModel");
const bcrypt = require("bcryptjs");

const Model = User;

exports.deleteOne = () => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(404, "fail", "No document found with that id"),
        req,
        res,
        next
      );
    }

    res.status(204).json({
      status: "success",
      data: null
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOne = () => async (req, res, next) => {
  try {
    const values = { ...req.body };
    if (req.body.password) {
      values.password = await bcrypt.hash(req.body.password, 12);
    }
    const doc = await Model.findByIdAndUpdate(req.params.id, values, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(
        new AppError(404, "fail", "No document found with that id"),
        req,
        res,
        next
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        doc
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.createOne = () => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: {
        doc
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getOne = () => async (req, res, next) => {
  try {
    const doc = await Model.findById({
      _id: req.params.id,
      status: "active"
    }).lean();
    const { wallet } = await Wallet.findOne({ user: doc._id }).select(
      "wallet.public"
    );
    if (!doc) {
      return next(
        new AppError(404, "fail", "No document found with that id"),
        req,
        res,
        next
      );
    }

    res.status(200).json({
      status: "success",
      data: {
        ...doc,
        ethWallet: wallet.public
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll = () => async (req, res, next) => {
  try {
    const users = await Model.find({ status: "active" });

    res.status(200).json({
      status: "success",
      data: {
        data: users
      }
    });
  } catch (error) {
    next(error);
  }
};
exports.blockUser = () => async (req, res, next) => {
  try {
    await Model.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { status: "block" } }
    );
    await offer.updateMany({ user: req.body.id }, { $set: { status: false } });
    res.status(200).json({
      status: "success",
      message: "User has been blocked"
    });
  } catch (error) {
    next(error);
  }
};
exports.unBlockUser = () => async (req, res, next) => {
  try {
    await Model.findOneAndUpdate(
      { _id: req.body.id },
      { $set: { status: "active" } }
    );
    await offer.updateMany({ user: req.body.id }, { $set: { status: true } });
    res.status(200).json({
      status: "success",
      message: "User has been unblocked"
    });
  } catch (error) {
    next(error);
  }
};

exports.blockList = () => async (req, res, next) => {
  try {
    const list = await Model.find({ status: "block" });
    res.status(200).json({
      status: "success",
      data: {
        data: list
      }
    });
  } catch (error) {
    next(error);
  }
};
