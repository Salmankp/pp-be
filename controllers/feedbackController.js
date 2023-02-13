const feedBack = require("../models/feedBackModel");
const AppError = require("../utils/appError");

const Model = feedBack;
exports.deleteOne = async (req, res, next) => {
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
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOne = async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
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
        doc,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.createOne = async (req, res, next) => {
  const values = { ...req.body };
  try {
    const doc = await Model.create(values);
    res.status(201).json({
      status: "success",
      data: {
        doc,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const doc = await Model.find({ sellerId: req.params.id })
      .populate("sellerId +password")
      .populate("buyerId +password")
      .populate("offerId");
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
        doc,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const feedBacks = await Model.find({});

    res.status(200).json({
      status: "success",

      data: {
        data: feedBacks,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getOfferFeedBacks = async (req, res, next) => {
  try {
    let doc = await Model.find()
      .populate({
        path: "buyerId",
        select: {
          name: 1,
          profilePic: 1,
        },
      })
      .populate({
        path: "sellerId",
        select: {
          name: 1,
          profilePic: 1,
        },
      })
      .populate({ path: "paymentMethod", select: "name" });

    doc = doc.filter((item) => {
      return item.offerId == req.params.id;
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
        doc,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactionFeedBacks = async (req, res, next) => {
  try {
    let doc = await Model.find();

    doc = doc.filter((item) => {
      return item.transId == req.params.id;
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
        doc,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserFeedBacks = async (req, res, next) => {
  const id = req.params.id;
  console.log('hadi',id); 
  try {
    let doc = await Model.find().populate({
      path: "offerId",
      populate: {
        path: "user",
      }
    })
      .populate({
        path: "buyerId",
        select: {
          name: 1,
          profilePic: 1,
        },
      })
      .populate({
        path: "sellerId",
        select: {
          name: 1,
          profilePic: 1,
        },
      });
      doc = doc.filter((item) => {
        item.offerId.user._id = id;
      })
      console.log('item',doc);
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
        doc,
      },
    });
  } catch (error) {
    next(error);
  }
};
