const mongoose = require("mongoose");

const offerTags = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    slug: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const OfferTags = mongoose.model("OfferTags", offerTags);
module.exports = OfferTags;
