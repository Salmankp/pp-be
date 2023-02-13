const OfferTags = require("../models/offerTagsModel");

exports.addTags = async (req, res, next) => {
  console.log(req.body);
  try {
    const update = await OfferTags.create(req.body);
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

exports.getTags = async (req, res, next) => {
  try {
    const update = await OfferTags.find();
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else
      res.status(404).json({
        status: "failed",
        message: "Offer Tags Not Found"
      });
  } catch (err) {
    next(err);
  }
};
