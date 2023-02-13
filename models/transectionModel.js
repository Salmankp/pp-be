const mongoose = require("mongoose");
const { addNotifUtil } = require("../controllers/notificationsController");

const TranSectionSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  buyerId: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  sellerWallet: {
    type: String,
    require: true
  },
  buyerWallet: {
    type: String,
    require: true
  },
  offerId: {
    type: mongoose.Types.ObjectId,
    ref: "Offer"
  },
  transactionId: {
    type: Number,
    require: true
  },
  transferBankID: {
    type: mongoose.Types.ObjectId,
    ref: "BankAccount"
  },
  transferType: {
    type: String
  },
  cryptoAmount: {
    type: Number,
    default: 0
  },
  fiatAmount: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: mongoose.Types.ObjectId,
    ref: "subPaymentMethod"
  },
  preferredCurrency: {
    type: String,
    require: true
  },
  paid: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ["created", "pending", "completed", "dispute"],
    default: "created"
  },
  cryptoCurrencyType: {
    type: String,
    enum: ["bitcoin", "ethereum", "USDT"],
    required: true
  },
  started: {
    type: Date,
    default: Date.now()
  },
  completed: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now()
  }
});

TranSectionSchema.post("findOneAndUpdate", async doc => {
  let data = await doc?.populate("offerId")?.execPopulate();
  if (data?.offerId?.tradingMethod === "sell" && data?.status === "pending") {
    const req = { body: { user: data.sellerId, transaction: data._id } };
    addNotifUtil(req);
  }
});
TranSectionSchema.post("findOne", async (doc, next) => {
  let data = await doc?.populate("offerId")?.execPopulate();
  if (data?.offerId?.tradingMethod === "buy" && data?.status === "created") {
    const req = { body: { user: data.buyerId, transaction: data._id } };
    addNotifUtil(req);
    next();
  }
});

const transaction = mongoose.model("transaction", TranSectionSchema);
module.exports = transaction;
