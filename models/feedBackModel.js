const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    buyerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    offerId: {
      type: mongoose.Types.ObjectId,
      ref: "Offer",
    },
    paymentMethod: {
      type: mongoose.Types.ObjectId,
      ref: "subPaymentMethod",
    },
    transId: {
      type: Number
    },
    comment: {
      type: String,
      // required: true
    },
    Like: {
      type: Number,
      default: 0,
    },
    disLike: {
      type: Number,
      default: 0,
    },
    Type: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      // required:true,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

const feedback = mongoose.model("feedback", feedbackSchema);
module.exports = feedback;
