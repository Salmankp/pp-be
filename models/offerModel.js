const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User"
  },
  cryptoCurrencyType: {
    type: String,
    enum: ["bitcoin", "ethereum", "USDT"],
    required: true
  },
  //buy or sale
  tradingMethod: {
    type: String,
    enum: ["buy", "sell"],
    required: true
  },
  preferredCurrency: {
    type: String
  },
  tradingType: {
    type: String,
    enum: ["fixedPrice", "marketPrice"]
  },
  tradeMin: {
    type: Number,
    required: true
  },
  tradeMax: {
    type: Number,
    required: true
  },
  offerMargin:{
    marginType: {
      type: String,
      enum: ['basic', 'advance'],
      default: 'basic'
    },
    margin: {
      type: Number,
      required: true
    },
    source: String,
    pricePoint: String,
  },
  offerTimeLimit: {
    type: Number,
    required: true,
    max: 30,
    min: 5
  },
  fixedPriceMarketRate: {
    type: Number,
    default: 0
  },
  fixedPriceAmount: {
    type: Number,
    default: 0
  },
  isFixedAmountTrade: {
    type: Boolean,
    default: false
  },
  offerTags: [
    {
      type: mongoose.Types.ObjectId,
      ref: "OfferTags"
    }
  ],
  offerLabel: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: true
  },
  offerTerms: {
    type: String,
    required: true
  },
  tradeInstructions: {
    type: String,
    required: true
  },
  requireVerificationID: {
    type: Boolean,
    default: false
  },
  requireVerificationName: {
    type: Boolean,
    default: false
  },
  subPaymentMethodId: {
    type: mongoose.Types.ObjectId,
    ref: "subPaymentMethod"
  },
  paymentMethodId: {
    type: mongoose.Types.ObjectId,
    ref: "paymentMethod"
  },
  isGiftCard: {
    type: Boolean,
    default: false
  },
  likeCount: {
    type: Number,
    default: 0
  },
  disLikeCount: {
    type: Number,
    default: 0
  },
  likes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User"
    }
  ],
  disLikes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User"
    }
  ],
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedName: {
    type: Boolean,
    default: false
  },
 
  cancel: {
    type: Boolean,
    default: false
  },
  expired: {
    type: Boolean,
    default: false
  },
  tradeSpeed: {
    type: Number,
    default: 0
  },
  

  tradExperience: {
    type: String,
    enum: ['classic', 'automatic', ''],
    default: ''
  },
  cardType: {
    type: String,
    enum: ['physical', 'ecard', ''],
    default: ''
  },
  paymentCards: [
    {
      type: mongoose.Types.ObjectId,
      ref: "paymentCard"
    }
  ],
  advanceOptions:{
    offerLocation: {
      type: String,
      default: ""
    },
    pastTradeValue: {
      type: Number,
      default: 0
    },
    limitForNewUser: {
      type: Number,
      default: 0
    },
    blockedNone: {
      type: Boolean,
      default: false
    },
    allowedCountries: {
      type: Boolean,
      default: false
    },
    blockedCountries: {
      type: Boolean,
      default: false
    },
    vpnAllowed: {
      type: Boolean,
      default: false
    },
    selectedCountriesToBlockOrAllow: {
      type: [String],
      default: []
    },
    timeZone: {
      type: String,
      default: ""
    },
  },
  createdAt: { type: Date, default: Date.now }
});

const Offer = mongoose.model("Offer", offerSchema);
module.exports = Offer;
