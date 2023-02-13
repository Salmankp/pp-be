const multer = require('multer');
const sharp = require('sharp');
const { Types } = require("mongoose");
const Offer = require("../models/offerModel");
const paymentCard = require("../models/paymentCard");
const AppError = require("../utils/appError");
const { filterKeys } = require("../utils/offerFilters");
const { sendNotification } = require("./notificationsController");

const multerStorage = multer.memoryStorage();


const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'fail', 'Not an image! upload only images'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPaymentCardImage = upload.single('image');

exports.resizePaymentCardImage = async (req, res, next) => {
  try {
    console.log(req.user);
    if (!req.file) return next();
    req.file.filename = `card-${req.user._id}-${Date.now()}.jpeg`;
    await sharp(req.file.buffer)
      .resize(600, 400)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/paymentCards/${req.file.filename}`);
    res.status(200).json({
      status: "success",
      data: `img/paymentCards/${req.file.filename}`
    });
  } catch (err) {
    return next(new AppError(404, "fail", "image failed to upload"))
  }
}

exports.createOffer = async (req, res, next) => {
  const inputs = req.body;
  let cards = []
  if (req?.body?.paymentCards && req?.body?.paymentCards?.length > 0) {
    let _cards = await req?.body?.paymentCards?.map(async item => {
      const _res = await paymentCard.create({
        user: req.user._id,
        subPayMethod: inputs.subPaymentMethodId,
        code: item?.code,
        amount: item?.amount,
        image: item?.image || undefined,
      })
      return _res?._id
    })

    cards = await Promise.all(_cards)
  }
  const values = {
    user: req.user._id,
    cryptoCurrencyType: inputs.cryptoCurrencyType,
    tradingMethod: inputs.tradingMethod,
    preferredCurrency: inputs.preferredCurrency,
    tradingType: inputs.tradingType,
    tradeMin: inputs.tradeMin,
    tradeMax: inputs.tradeMax,
    offerMargin: inputs.offerMargin,
    offerTimeLimit: inputs.offerTimeLimit,
    fixedPriceAmount: inputs.fixedPriceAmount,
    fixedPriceMarketRate: inputs.fixedPriceMarketRate,
    offerTags: inputs.offerTags,
    offerLabel: inputs.offerLabel,
    offerTerms: inputs.offerTerms,
    tradeInstructions: inputs.tradeInstructions,
    subPaymentMethodId: inputs.subPaymentMethodId,
    paymentMethodId: inputs.paymentMethodId,
    offerLocation: inputs.offerLocation,
    isVerified: inputs.verifiedID,
    pastTradeValue: inputs.pastTradeValue,
    limitForNewUser: inputs.limitForNewUser,
    blockedNone: inputs.blockedNone,
    blockedCountries: inputs.blockedCountries,
    verifiedName: inputs.verifiedName,
    allowedCountries: inputs.allowedCountries,
    vpnAllowed: inputs.vpnAllowed,
    timeZone: inputs.timeZone,
    selectedCountriesToBlockOrAllow: inputs.selectedCountriesToBlockOrAllow,
    advanceOptions:inputs.advanceOptions,
    tradExperience: inputs.tradExperience,
    cardType: inputs.cardType,
    paymentCards: cards,

  };
  try {
    const offer = await Offer.create({ ...values });
    if (offer) {
      res.status(200).json({
        status: "success",
        data: offer
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.updateOffer = async (req, res, next) => {
  const user = req.user._id;
  const offerId = req.body._id;
  const updateInputs = req.body;
  try {

    let cards = []
    if (req?.body?.paymentCards && req?.body?.paymentCards?.length > 0) {
      let _cards = await req?.body?.paymentCards?.map(async item => {
        if (Types?.ObjectId.isValid(item?._id) && await paymentCard.findById(item?._id)) {
          const _res = await paymentCard.findByIdAndUpdate(item?._id, {
            code: item?.code,
            amount: item?.amount,
            image: item?.image || undefined,
          }, { new: true })
          return _res?._id
        } else {
          const _res = await paymentCard.create({
            user: req.user._id,
            subPayMethod: updateInputs.subPaymentMethodId,
            code: item?.code,
            amount: item?.amount,
            image: item?.image || undefined,
          })
          return _res?._id
        }

      })

      cards = await Promise.all(_cards)
    }



    const offer = await Offer.findOneAndUpdate(
      {
        _id: offerId,
      },
      { ...updateInputs, paymentCards: cards },
      { new: true })

    res.status(200).json({
      status: "success",
      data: offer,
    });
    // }
  } catch (error) {
    next(error);
  }
};

exports.getOffers = async (req, res, next) => {
  let { filters, type, area } = req?.query;
  filters = JSON.parse(filters);
  const key = filterKeys(filters);
  console.log(filters);
  try {
    const one = 10;
    const page = req.params.page;

    const preferredCurrency = area === "local" ? "PKR" : { $ne: "PKR" };

    const offers = await Offer.aggregate([
      {
        $lookup: {
          from: "paymentmethods",
          localField: "paymentMethodId",
          foreignField: "_id",
          as: "paymentMethodId"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: '$user' },
      {
        $match: {
          $and: [
            {
              preferredCurrency: preferredCurrency,
              tradingMethod: type,
              user: { $ne: req.user._id },
              ...key
            }
          ]
        }
      },
      {
        $sort: {
          ...(filters?.priceFilter !== undefined && filters?.priceFilter !== 0
            ? { offerMargin: filters?.priceFilter }
            : filters?.speedFilter !== undefined && filters?.speedFilter !== 0
              ? { tradeSpeed: filters?.speedFilter }
              : filters?.activeFilter === true
                ? { lastSeenTime: 1 }
                : { createdAt: -1 })
        }
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: (page - 1) * one }, { $limit: one }]
        }
      }
    ]);

    console.log("Offers1:", offers);
    if (offers) {
      res.status(200).json({
        status: "success",
        data: {
          ...(area === "local"
            ? { offersCount: offers[0]?.metadata[0]?.total }
            : { worldWideOfferscount: offers[0]?.metadata[0]?.total }),
          ...(area === "local"
            ? { offers: offers[0]?.data }
            : { worldWideOffers: offers[0]?.data })
        }
      });
    }
  } catch (error) {
    console.log(error, req.query);
    next(error);
  }
};

exports.giftCardOffer = async (req, res, next) => {
  let option = { tradingMethod: "buy", status: true };
  if (req?.query?.paymentMethod) {
    option.paymentMethodId = req.query.paymentMethod;
  }
  console.log(req.query);
  if (req?.query?.subPaymentMethodId) {
    option.subPaymentMethodId = req.query.subPaymentMethodId;
  }
  if (req?.query?.isGiftCard) {
    option.isGiftCard = req.query.isGiftCard;
  }
  try {
    const offers = await Offer.find(option)
      .populate("user name")
      .populate("subPaymentMethodId");
    if (offers) {
      res.status(200).json({
        status: "success",
        data: offers
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.addLike = async (req, res, next) => {
  const user = req.user._id;
  const offer = req.body._id;
  if (!user || !offer) next(new Error("UserId or OfferId not provided"));
  try {
    const update = await Offer.findOneAndUpdate(
      {
        _id: offer,
        likes: { $ne: user },
        disLikes: { $ne: user }
      },
      {
        $inc: { likeCount: 1 },
        $push: { likes: user }
      },
      {
        new: "true"
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else next(new Error("Unable to Find Offer or Already Liked!"));
  } catch (err) {
    next(err);
  }
};

exports.removeLike = async (req, res, next) => {
  const user = req.user._id;
  const offer = req.body._id;

  if (!user || !offer) next(new Error("UserId or OfferId not provided"));

  try {
    const update = await Offer.findOneAndUpdate(
      {
        _id: offer,
        likes: user
      },
      {
        $inc: { likeCount: -1 },
        $pull: { likes: user }
      },
      {
        new: "true"
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else next(new Error("Unable to Find Offer or Already Not Liked!"));
  } catch (err) {
    next(err);
  }
};

exports.addDisLike = async (req, res, next) => {
  const user = req.user._id;
  const offer = req.body._id;
  if (!user || !offer) next(new Error("UserId or OfferId not provided"));
  try {
    const update = await Offer.findOneAndUpdate(
      {
        _id: offer,
        disLikes: { $ne: user },
        likes: { $ne: user }
      },
      {
        $inc: { disLikeCount: 1 },
        $push: { disLikes: user }
      },
      {
        new: "true"
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else next(new Error("Unable to Find Offer or Already Liked!"));
  } catch (err) {
    next(err);
  }
};

exports.removedisLike = async (req, res, next) => {
  const user = req.user._id;
  const offer = req.body._id;

  if (!user || !offer) next(new Error("UserId or OfferId not provided"));

  try {
    const update = await Offer.findOneAndUpdate(
      {
        _id: offer,
        disLikes: user
      },
      {
        $inc: { disLikeCount: -1 },
        $pull: { disLikes: user }
      },
      {
        new: "true"
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update
      });
    } else next(new Error("Unable to Find Offer or Already Not Liked!"));
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    let doc = await Offer.findById(req.params.id).populate(
      "user paymentMethodId subPaymentMethodId offerTags paymentCards"
    );

    if (doc === null) {
      next(new Error("Unable to Find Offer!"));
      return;
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

exports.getByPaymentId = async (req, res, next) => {
  try {
    let doc = await Offer.find({ paymentMethodId: req.params.id }).populate(
      "user paymentMethodId"
    );

    if (doc === null) {
      next(new Error("Unable to Find Offer against this payment method!"));
      return;
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

exports.updateCancel = async (req, res, next) => {
  const offer = req.body._id;
  try {
    let update = await Offer.findByIdAndUpdate(
      { _id: offer },
      {
        $set: { cancel: true }
      },
      {
        new: true,
        runValidators: true
      }
    );
    if (!update) {
      return next(
        new AppError(404, "fail", "No document found with that id"),
        req,
        res,
        next
      );
    }
    await sendNotification({
      receiver: req.body.receiver,
      link: '',
      type: 'tradeCancelledExpired',
      description: `Trade ${req.body.description} cancel`
    })

    res.status(200).json({
      status: "success",
      data: update
    });
  } catch (err) {
    next(err);
  }
};

exports.updateExpired = async (req, res, next) => {
  const offer = req.body._id;
  try {
    let update = await Offer.findByIdAndUpdate(
      { _id: offer },
      {
        $set: { expired: true }
      },
      {
        new: true,
        runValidators: true
      }
    );
    if (!update) {
      return next(
        new AppError(404, "fail", "No document found with that id"),
        req,
        res,
        next
      );
    }
    res.status(200).json({
      status: "success",
      data: update
    });
  } catch (err) {
    next(err);
  }
};

exports.getUserAllOffer = async (req, res, next) => {
  try {
    let doc = await Offer.find({ user: req.params.id });
    // doc = doc.filter(item => {
    //   return item.user._id == req.params.id;
    // });
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

exports.getUserAllOfferBuy = async (req, res, next) => {
  try {
    let doc = await Offer.find({ tradingMethod: "buy", user: req.params.id }).populate({
      path: "user"
    });
    // doc = doc.filter(item => {
    //   return item.user._id == req.params.id;
    // });
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

exports.getUserAllOfferSell = async (req, res, next) => {
  try {
    let doc = await Offer.find({ tradingMethod: "sell", user: req.params.id  }).populate({
      path: "user"
    });
    // doc = doc.filter(item => {
    //   return item.user._id == req.params.id;
    // });
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
