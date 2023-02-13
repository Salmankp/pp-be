const mongoose = require("mongoose");
var CryptoJS = require("crypto-js");
const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  wallet: {
    private: {
      type: String,
      required: true
    },
    public: {
      type: String,
      required: true
    },
    currency: {
      type: String,
      required: true
    },
    create_date: {
      type: Date,
      default: Date.now
    },
    sent: {
      type: Number,
      default: 0
    },
    received: {
      type: Number,
      default: 0
    },
    link: {
      type: String,
      default: ""
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

walletSchema.pre("save", async function (next) {
  try {
    this.wallet.private = await CryptoJS.AES.encrypt(
      this.wallet.private,
      process.env.WALLET_SECRET_KEY
    ).toString();
  } catch (err) {
    next(err);
  }
  // Delete passwordConfirm field
  next();
});

walletSchema.post("find", async function (data, next) {
  try {
    data = data.map(data => {
      data.wallet.private = CryptoJS.AES.decrypt(
        data.wallet.private,
        process.env.WALLET_SECRET_KEY
      ).toString(CryptoJS.enc.Utf8);
    });
  } catch (err) {
    next(err);
  }
  // Delete passwordConfirm field
  next();
});

const Wallet = mongoose.model("Wallet", walletSchema);
module.exports = Wallet;
