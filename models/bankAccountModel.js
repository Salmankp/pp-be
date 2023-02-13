const mongoose = require("mongoose");

const bankAccount = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    accountType: {
      type: String,
      enum: ["personal", "business"],
      required: true
    },
    country: {
      type: String,
      required: true
    },
    currency: {
      type: String,
      required: true
    },
    bankName: {
      type: String,
      required: true
    },
    accountHolderName: {
      type: String,
      required: true
    },
    accountNumber: {
      type: String,
      required: false
    },
    details: {
      type: String,
      required: false
    },
    internationalTransferDetails: {
      countryOfResidency: {
        type: String
      },
      state: {
        type: String
      },
      city: {
        type: String
      },
      zipCode: {
        type: String
      },
      address: {
        type: String
      }
    }
  },
  { timestamps: true }
);

const BankAccount = mongoose.model("BankAccount", bankAccount);
module.exports = BankAccount;
