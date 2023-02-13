const { number } = require("joi");
const mongoose = require("mongoose");

const notificationSettings = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bitcoinPriceChange: {
      type: Array,
      default: null,
    },
    buyerStartedUploadingCards: {
      type: Array,
      default: null,
    },
    cryptocurrencyDepositConfirmed: {
      type: Array,
      default: null,
    },
    cryptocurrencyDepositPending: {
      type: Array,
      default: null,
    },
    cryptocurrencyPurchased: {
      type: Array,
      default: null,
    },
    cryptocurrencySent: {
      type: Array,
      default: null,
    },
    cryptocurrencySold: {
      type: Array,
      default: null,
    },
    fundsReservedForTrade: {
      type: Array,
      default: null,
    },
    incomingTrade: {
      type: Array,
      default: null,
    },
    newChatMessage: {
      type: Array,
      default: null,
    },
    newModeratorMessage: {
      type: Array,
      default: null,
    },
    partnerPaidForTrade: {
      type: Array,
      default: null,
    },
    someoneViewedMyProfile: {
      type: Array,
      default: null,
    },
    tetherPriceChange: {
      type: Array,
      default: null,
    },
    tradeCancelledExpired: {
      type: Array,
      default: null,
    },
    notificationTimeInterval: {
      type: Number,
      default: null,
    },
    playSound: {
      type: Boolean,
      default: false,
    },
    occasionalEmails: {
      type: Boolean,
      default: false,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const NotificationSettings = mongoose.model(
  "NotificationSettings",
  notificationSettings
);
module.exports = NotificationSettings;
