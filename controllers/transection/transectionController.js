const AppError = require("../../utils/appError");
const Transaction = require("../../models/transectionModel");
const { User } = require("../../models/userModel");
const { io } = require("../../socket");
const moment = require("moment");
const Offer = require("../../models/offerModel");

const Model = Transaction;
const {
  getSellerWalletDetails,
  getBuyerWalletDetails,
} = require("../../services/transectionServices");
const {
  setUser,
  depositEth,
  deliveryEth,
  disputeEth,
  transferBuyer,
  transferEscrow,
} = require("../../services/blockainServices/escrowService");
const timeArray = ["1 mins ago", "2 mins ago", "3 mins ago"];
exports.allTransactions = (req, res, next) => {
  console.log("hello world: ", req.body);
  res.status(200).json({
    status: "success",
  });
};

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
    }).populate("offerId");

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
  const inputs = req.body;
  console.log("in create", inputs);
  const values = {
    sellerId: inputs.sellerId,
    buyerId: inputs.buyerId,
    offerId: inputs.offerId,
    transactionId: inputs.transactionId,
    cryptoAmount: inputs.cryptoAmount,
    fiatAmount: inputs.fiatAmount,
    paymentMethod: inputs.paymentMethod,
    preferredCurrency: inputs.preferredCurrency,
    cryptoCurrencyType: inputs.cryptoCurrencyType,
    sellerWallet: inputs.sellerWallet,
    buyerWallet: inputs.buyerWallet,
    transferBankId: inputs.transferBankId,
    transferType: inputs.transferType,
  };

  try {
    const trans = await Model.create(values);
    const EscrowValues = {
      trading_id: trans.transactionId,
      buyer_address: trans.buyerWallet,
      seller_address: trans.sellerWallet,
      from_address: process.env.ADMIN_WALLET,
      from_private_key: process.env.ADMIN_WALLET_SECRET_KEY,
    };
    const setuser = await setUser(EscrowValues);
    console.log(setuser);
    if (setuser?.ResponseData?.success) {
      const transaction = await Model.findById(trans._id).populate("offerId");
      res.status(201).json({
        status: "success",
        data: {
          transaction,
        },
      });
    } else if (setuser?.ResponseCode === 400) {
      console.log("response:", setuser.ResponseData);
      next(setuser);
      res.status(400).json({
        status: "failed",
        error: setuser.ResponseMessage,
      });
    }
  } catch (error) {
    // console.log(setuser);
    res.status(500).json({
      status: "failed",
      message: "Internal Server Error",
    });
  }
};

// exports.getOne = async (req, res, next) => {
//   const limit = 10;
//   const page = 1;

//   try {
//     const doc = await Model.findById({
//       _id: req.params.id,
//       status: "active"
//     })
// .limit(limit * 1)
// .skip((page - 1) * limit)
//       .lean();
//     const { wallet } = await Wallet.findOne({ user: doc._id }).select(
//       "wallet.public"
//     );
//     if (!doc) {
//       return next(
//         new AppError(404, "fail", "No document found with that id"),
//         req,
//         res,
//         next
//       );
//     }
//     res.status(200).json({
//       status: "success",
//       data: {
//         ...doc,
//         ethWallet: wallet.public
//       }
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.paid = async (req, res, next) => {
  try {
    const escrowValues = {
      trading_id: req.body.trading_id,
      value: req.body.value,
      from_address: process.env.ADMIN_WALLET,
      from_private_key: process.env.ADMIN_WALLET_SECRET_KEY,
    };
    console.log(escrowValues);
    const response = await depositEth(escrowValues);
    if (response.data.success) {
      const doc = await Model.findOneAndUpdate(
        { _id: req.body._id, status: "created" },
        { status: "pending", paid: true, started: Date.now() },
        { new: true }
      ).populate("offerId");
      if (!doc) {
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
        type: 'cryptocurrencyDepositPending',
        description: req.body.description
      })
      res.status(200).json({
        status: "success",
        data: {
          doc,
        },
      });
    } else {
      next(response);
    }
  } catch (error) {
    next(error);
  }
};

exports.transferEscrow = async (req, res, next) => {
  try {
    const EscrowValues = {
      from_address: req.body.from_address,
      from_private_key: req.body.from_private_key,
      to_address: process.env.ADMIN_WALLET_USDT,
      value: req.body.value,
      trading_id: req.body.trading_id,
    };

    const response = await transferEscrow(EscrowValues);
    if (response.code === 200) {
      const doc = await Model.findOneAndUpdate(
        { _id: req.body._id, status: "created" },
        { status: "pending", paid: true },
        { new: true }
      ).populate("offerId");

      if (!doc) {
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
        type: 'cryptocurrencyDepositPending',
        description: req.body.description
      })
      res.status(200).json({
        status: "success",
        data: {
          doc,
        },
      });
    } else {
      next(response);
    }
  } catch (error) {
    next(error);
  }
};

exports.transferBuyer = async (req, res, next) => {
  console.log("here");
  try {
    const EscrowValues = {
      from_address: process.env.ADMIN_WALLET_USDT,
      from_private_key: process.env.ADMIN_WALLET_SECRET_KEY_USDT,
      to_address: req.body.to_address,
      value: req.body.value,
      trading_id: req.body.trading_id,
    };
    const transactionId = req.body.trading_id;

    const response = await transferBuyer(EscrowValues);

    if (response.code === 200) {
      const doc = await Model.findOneAndUpdate(
        { buyerId: req.body.buyerId, status: "pending", transactionId },
        { status: "completed", paid: true },
        { new: true }
      ).populate("offerId");
      if (!doc) {
        return next(
          new AppError(404, "fail", "No document found with that id"),
          req,
          res,
          next
        );
      }
      await sendNotification({
        receiver: req.body.receiverBuyer,
        link: '',
        type: 'cryptocurrencyDepositConfirmed',
        description: req.body.description
      })
      await sendNotification({
        receiver: req.body.receiverSeller,
        link: '',
        type: 'cryptocurrencySent',
        description: req.body.description
      })
      await sendNotification({
        receiver: req.body.receiverBuyer,
        link: '',
        type: 'cryptocurrencyPurchased',
        description: req.body.description
      })
      await sendNotification({
        receiver: req.body.receiverSeller,
        link: '',
        type: 'cryptocurrencySold',
        description: req.body.description
      })
      io.emit("transaction-released", { data: doc });
      res.status(200).json({
        status: "success",
        data: {
          doc,
        },
      });
    } else {
      next(response);
    }
  } catch (error) {
    next(error);
  }
};

exports.release = async (req, res, next) => {
  console.log(req.body);
  try {
    //only seller can release the trade
    const { sellerPublicAddress, sellerPrivateKey } =
      await getSellerWalletDetails(req.body.trading_id);
    const escrowValues = {
      trading_id: req.body.trading_id,
      from_address: sellerPublicAddress,
      from_private_key: sellerPrivateKey,
    };

    const response = await deliveryEth(escrowValues);
    console.log(response, req.body);
    if (response.data.success) {
      const doc = await Model.findOneAndUpdate(
        { _id: req.body._id, status: "pending" },
        { status: "completed" },
        { new: true }
      ).populate("offerId");
      if (!doc) {
        return next(
          new AppError(404, "fail", "No document found with that id"),
          req,
          res,
          next
        );
      }
      await sendNotification({
        receiver: req.body.receiverBuyer,
        link: '',
        type: 'cryptocurrencyDepositConfirmed',
        description: req.body.description
      })
      await sendNotification({
        receiver: req.body.receiverSeller,
        link: '',
        type: 'cryptocurrencySent',
        description: req.body.description
      })
      await sendNotification({
        receiver: req.body.receiverBuyer,
        link: '',
        type: 'cryptocurrencyPurchased',
        description: req.body.description
      })
      await sendNotification({
        receiver: req.body.receiverSeller,
        link: '',
        type: 'cryptocurrencySold',
        description: req.body.description
      })
      io.emit("transaction-released", { data: doc });
      res.status(200).json({
        status: "success",
        data: {
          doc,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
exports.dispute = async (req, res, next) => {
  try {
    //only buyer call this api
    const transactionId = req.body.trading_id;

    const doc = await Model.findOneAndUpdate(
      { buyerId: req.body.buyerId, status: "pending", transactionId },
      { status: "dispute", paid: true },
      { new: true }
    ).populate("offerId");
    console.log("======>", doc);

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
exports.resolveDispute = async (req, res, next) => {
  try {
    const data = await User.findById({ _id: req.user._id });

    //it is only for admin should have check
    const { sellerPublicAddress, sellerPrivateKey } =
      await getSellerWalletDetails(req.body.trading_id);
    const escrowValues = {
      trading_id: req.body.trading_id,
      from_address: sellerPublicAddress,
      from_private_key: sellerPrivateKey,
    };
    const response = await disputeEth(escrowValues);
    console.log("response", response);
    const doc = await Model.findOneAndUpdate(
      { _id: req.body._id, status: "dispute" },
      { status: "completed", paid: true }
    ).populate("offerId");
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
    const users = await Model.find({ status: "created" })
      .populate({
        path: "paymentMethod",
        model: "paymentMethod",
      })
      .populate({
        path: "sellerId",
      })
      .populate({
        path: "offerId",
        select: {
          tradingMethod: 1,
        },
      })
      .sort({ _id: -1 })
      .limit(3);
    res.status(200).json({
      status: "success",
      data: {
        data: users,
      },
    });
  } catch (error) {
    next(error);
  }
};


exports.getWithTradingId = async (req, res, next) => {
  try {
    const transaction = await Model.findOne({ transactionId: req.params.id })

    if (transaction) {
      res.status(200).json({
        status: "success",
        data: {
          transaction
        },
      });
    } else next(new Error("Unable to find Transactions against this offer Id"));
  } catch (error) {
    next(error);
  }
};

exports.getOne = async (req, res, next) => {
  const limit = 10;
  const page = req.params.page;
  const id = req.user._id;
  try {
    const data = await Model.find({
      $or: [
        {
          buyerId: id,
        },
        {
          sellerId: id,
        },
      ],
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate({ path: 'sellerId buyerId' })
      .populate({
        path: "paymentMethod",
        model: "paymentMethod",
      })
      .populate({
        path: "offerId",
        model: 'Offer',
        populate: {
          path: "user subPaymentMethodId",
        },
      })
      .sort({ created: -1 });
    const count = await Model.countDocuments({
      $or: [
        {
          buyerId: id,
        },
        {
          sellerId: id,
        },
      ],
    });
    res.status(200).json({
      status: "success",
      data: {
        count,
        data,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.filterTrades = async (req, res, next) => {
  let limit = 10;
  let page = req.body.page;
  const filters = req.body.filters;
  const id = req.user._id;
  if (!page || page == 0) {
    page = 1;
    limit = 5000;
  }
  // const id = "6278a9b736a14d03abcf55da";
  try {
    let txQuery = {};

    if (filters.cryptoCurrencyType && filters.cryptoCurrencyType.length > 0)
      txQuery.cryptoCurrencyType = { $in: filters.cryptoCurrencyType };
    if (filters.tradingStatus && filters.tradingStatus.length > 0)
      txQuery.status = { $in: filters.tradingStatus };
    // if (filters.dateRange && filters.dateRange.length > 0)
    //   txQuery.created = { $gte: filters.dateRange[0] };
    // if (filters.dateRange && filters.dateRange.length > 1)
    //   txQuery.created = { $lte: filters.dateRange[1] };
    if (
      filters.dateRange &&
      filters.dateRange.startDate &&
      filters.dateRange.endDate
    ) {
      txQuery.created = { $gte: filters.dateRange.startDate };
      txQuery.created.$lte = filters.dateRange.endDate;
    }

    let tradeQuery = {};
    if (filters.tradingType && filters.tradingType.length > 0)
      tradeQuery.tradingMethod = { $in: filters.tradingType };

    let pmQuery = {};
    if (filters.paymentMethod && filters.paymentMethod.length)
      pmQuery.name = { $in: filters.paymentMethod };

    const data = await Model.find({
      ...txQuery,
      $or: [
        {
          buyerId: id,
        },
        {
          sellerId: id,
        },
      ],
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate({
        path: "paymentMethod",
        model: "paymentMethod",
        match: pmQuery,
      })
      .populate({
        path: "offerId",
        populate: {
          path: "user",
        },
        match: tradeQuery,
      })
      .populate({
        path: "offerId",
        populate: {
          path: "subPaymentMethodId",
        },
        match: tradeQuery,
      })
      .sort({ created: -1 });
    const count = await Model.countDocuments({
      ...txQuery,
      $or: [
        {
          buyerId: id,
        },
        {
          sellerId: id,
        },
      ],
    });
    res.status(200).json({
      status: "success",
      data: {
        count,
        data,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.pendingTransactionList = async (req, res, next) => {
  try {
    const data = await User.findById({ _id: req.user._id });

    //it is only for admin should have check
    /* const { sellerPublicAddress, sellerPrivateKey } =
      await getSellerWalletDetails(req.body.trading_id);
    const escrowValues = {
      trading_id: req.body.trading_id,
      from_address: sellerPublicAddress,
      from_private_key: sellerPrivateKey
    };
    const response = await disputeEth(escrowValues);
    console.log("response", response); */
    console.log("++++++", req.user._id);
    const doc = await Model.find({
      $or: [
        {
          sellerId: req.user._id,
          status: "pending",
        },
        {
          buyerId: req.user._id,
          status: "created",
        },
      ],
    })
      .populate({
        path: "sellerId",
        select: {
          name: 1,
        },
      })
      .populate({
        path: "buyerId",
        select: {
          name: 1,
        },
      })
      .populate({
        path: "offerId",
      })
      .sort({ created: -1 })
      .exec();

    //  await Model.find($or:[{ sellerId: req.user._id, status: "pending" }, {buyerId: req.user._id, status: "created" }]);
    // doc.push(... await Model.find({ buyerId: req.user._id, status: "created" }));

    console.log("++++++", doc);
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
        doc: doc,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.vendorData = async (req, res, next) => {
  const user_id = req.user._id;
  const type = req.params.type;
  let d;
  let doc;
  var check = moment(new Date(), "YYYY/MM/DD");
  var currentMonth = check.format("MM");
  var currentYear = check.format("YYYY");
  try {
    let docs = await Model.find({
      $or: [
        {
          buyerId: user_id,
          cryptoCurrencyType: type,
          status: "completed",
        },
        {
          sellerId: user_id,
          cryptoCurrencyType: type,
          status: "completed",
        },
      ],
    });
    if (docs) {
      d = docs.filter((item) => {
        let date = moment(item.created, "YYYY/MM/DD");
        let month = date.format("MM");
        let year = date.format("YYYY");
        if (currentMonth - month == 1 && currentYear == year) {
          return item;
        }
      });
    }
    if (d.length) {
      doc = d.reduce((a, b) => ({
        cryptoAmount: a.cryptoAmount + b.cryptoAmount,
      }));
    }
    if (doc) {
      res.status(200).json({
        status: "success",
        data: {
          d,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.vendorTradeData = async (req, res, next) => {
  const user_id = req.params.id;
  const type = req.params.type;
  let docs;
  try {
    let doc = await Model.find({
      $or: [
        {
          buyerId: user_id,
          cryptoCurrencyType: type,
          status: "completed",
        },
        {
          sellerId: user_id,
          cryptoCurrencyType: type,
          status: "completed",
        },
      ],
    });

    if (doc.length) {
      docs = doc.reduce((a, b) => ({
        cryptoAmount: a.cryptoAmount + b.cryptoAmount,
      }));
    }
    if (docs) {
      res.status(200).json({
        status: "success",
        data: {
          docs,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.monthlyTotal = async (req, res, next) => {
  const user_id = req.user._id;
  const type = req.params.type;
  let d;
  let doc;
  var check = moment(new Date(), "YYYY/MM/DD");
  var currentMonth = check.format("MM");
  var currentYear = check.format("YYYY");
  try {
    let docs = await Model.find({
      $or: [
        {
          buyerId: user_id,
          status: "completed",
        },
        {
          sellerId: user_id,
          status: "completed",
        },
      ],
    });
    if (docs.length) {
      d = docs.filter((item) => {
        let date = moment(item.created, "YYYY/MM/DD");
        let month = date.format("MM");
        let year = date.format("YYYY");
        if (currentMonth - month == 1 && currentYear == year) {
          return item;
        }
      });
    }
    if (d.length) {
      doc = d.reduce((a, b) => ({
        cryptoAmount: a.cryptoAmount + b.cryptoAmount,
      }));
    }
    if (doc) {
      res.status(200).json({
        status: "success",
        data: {
          doc,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.closingRatio = async (req, res, next) => {
  const user_id = req.user._id;
  var check = moment(new Date(), "YYYY/MM/DD");
  var currentMonth = check.format("MM");
  var currentYear = check.format("YYYY");
  try {
    let docs = await Model.find({
      sellerId: user_id,
      status: "completed",
    });
    let d = docs.filter((item) => {
      let date = moment(item.created, "YYYY/MM/DD");
      let month = date.format("MM");
      let year = date.format("YYYY");
      if (currentMonth - month == 1 && currentYear == year) {
        return item;
      }
    });
    if (!docs) {
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
        d,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.totalTrades = async (req, res, next) => {
  const user_id = req.params.id;
  try {
    let doc = await Model.find({
      $or: [
        {
          buyerId: user_id,
          status: "completed",
        },
        {
          sellerId: user_id,
          status: "completed",
        },
      ],
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

exports.topOffers = async (req, res, next) => {
  try {
    // let doc = await Model.aggregate([
    //   {
    //     $match: { sellerId: req.user._id, status: "completed" }
    //   },
    //   { $sortByCount: "$offerId" },
    //   { $limit: 5 },
    // ]);
    let docs = await Model.find({
      sellerId: req.user._id,
      status: "completed",
    }).populate({
      path: "offerId",
      populate: {
        path: "subPaymentMethodId",
      },
    });
    let arrayInfo = Object.assign({});

    docs.forEach((item) => {
      if (arrayInfo.hasOwnProperty(item.offerId._id)) {
        arrayInfo[item.offerId._id] = arrayInfo[item.offerId._id] + 1;
      } else {
        arrayInfo[item.offerId._id] = 1;
      }
    });

    let values = Object.values(arrayInfo).sort((a, b) => (a < b ? 1 : -1));
    let topOneId = Object.keys(arrayInfo).filter(function (key) {
      return arrayInfo[key] === values[0];
    })[0];
    let topOne = docs.find(m => m.offerId._id == topOneId)
    let topTwoId = Object.keys(arrayInfo).filter(function (key) {
      return arrayInfo[key] === values[1];
    })[0];
    let topTwo = docs.find(m => m.offerId._id == topTwoId)
    let topThreeId = Object.keys(arrayInfo).filter(function (key) {
      return arrayInfo[key] === values[2];
    })[0];
    let topThree = docs.find(m => m.offerId._id == topThreeId)
    let Array = { topOne, topTwo, topThree };
    if (!docs) {
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
        Array
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.successfullTrades = async (req, res, next) => {
  const user_id = req.user._id;
  try {
    let docs = await Model.find({
      $or: [
        {
          buyerId: user_id,
          status: "completed",
        },
        {
          sellerId: user_id,
          status: "completed",
        },
      ],
    })
      .populate({
        path: "offerId",
        populate: {
          path: "subPaymentMethodId",
        },
      })
      .sort({ created: -1 })
      .limit(5);
    // const doc = docs.reduce((a, b) => ({
    //   cryptoAmount: a.cryptoAmount + b.cryptoAmount,
    // }));
    if (!docs) {
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
        // doc,
        docs,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.transPaymentMethods = async (req, res, next) => {
  const user_id = req.user._id;
  try {
    let doc = await Model.find({
      $or: [
        {
          buyerId: user_id,
          status: "completed",
        },
        {
          sellerId: user_id,
          status: "completed",
        },
      ],
    }).populate({
      path: "offerId",
      populate: {
        path: "subPaymentMethodId",
      },
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

exports.vendorTrustedUser = async (req, res, next) => {
  const user_id = req.user._id;
  try {
    let docs = await Model.find({
      sellerId: user_id,
      status: "completed",
    }).populate({
      path: "offerId",
      populate: {
        path: "likes",
      },
    });
    if (!docs) {
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
        docs,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getCancelledOffer = async (req, res, next) => {
  const user_id = req.user._id;
  try {
    let docs = await Model.find({
      buyerId: user_id,
    }).populate({
      path: "offerId",
      select: {
        expired: 1,
        offerLabel: 1,
        subPaymentMethodId: 1
      },
      populate: {
        path: "subPaymentMethodId",
      }
    });
    let arrayInfo = Object.assign({});

    docs.forEach((item) => {
      if (arrayInfo.hasOwnProperty(item.offerId._id)) {
        arrayInfo[item.offerId._id] = arrayInfo[item.offerId._id] + 1;
      } else {
        arrayInfo[item.offerId._id] = 1;
      }
    });

    let values = Object.values(arrayInfo).sort((a, b) => (a < b ? 1 : -1));
    let topOneId = Object.keys(arrayInfo).filter(function (key) {
      return arrayInfo[key] === values[0];
    })[0];
    let topOne = docs.find(m => m.offerId._id == topOneId)
    let topTwoId = Object.keys(arrayInfo).filter(function (key) {
      return arrayInfo[key] === values[1];
    })[0];
    let topTwo = docs.find(m => m.offerId._id == topTwoId)
    let topThreeId = Object.keys(arrayInfo).filter(function (key) {
      return arrayInfo[key] === values[2];
    })[0];
    let topThree = docs.find(m => m.offerId._id == topThreeId)
    let Array = { topOne, topTwo, topThree };

    if (!docs) {
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
        Array
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getExpiredOffer = async (req, res, next) => {
  const user_id = req.user._id;
  try {
    let docs = await Model.find({
      $or: [
        {
          buyerId: user_id,
        },
        {
          sellerId: user_id,
        },
      ],
    }).populate({
      path: "offerId",
      select: {
        expired: 1,
        offerLabel: 1,
        subPaymentMethodId: 1
      },
      populate: {
        path: "subPaymentMethodId",
      }
    });

    let arrayInfo = Object.assign({});

    docs.forEach((item) => {
      if (arrayInfo.hasOwnProperty(item.offerId._id)) {
        arrayInfo[item.offerId._id] = arrayInfo[item.offerId._id] + 1;
      } else {
        arrayInfo[item.offerId._id] = 1;
      }
    });

    let values = Object.values(arrayInfo).sort((a, b) => (a < b ? 1 : -1));
    let topOneId = Object.keys(arrayInfo).filter(function (key) {
      return arrayInfo[key] === values[0];
    })[0];
    let topOne = docs.find(m => m.offerId._id == topOneId)
    let topTwoId = Object.keys(arrayInfo).filter(function (key) {
      return arrayInfo[key] === values[1];
    })[0];
    let topTwo = docs.find(m => m.offerId._id == topTwoId)
    let topThreeId = Object.keys(arrayInfo).filter(function (key) {
      return arrayInfo[key] === values[2];
    })[0];
    let topThree = docs.find(m => m.offerId._id == topThreeId)
    let Array = { topOne, topTwo, topThree };
    if (!docs) {
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
        // docs,
        Array,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.recentTrades = async (req, res, next) => {
  const user_id = req.user._id;
  let data = [];
  try {
    let doc = await Model.find({
      $or: [
        {
          buyerId: user_id,
        },
        {
          sellerId: user_id,
        },
      ],
    })
      .populate({
        path: "offerId",
        populate: {
          path: "user",
        },
      })
      .sort({ created: -1 })
      .limit(5);
    if (doc && doc.length) {
      doc.forEach((item) => {
        data.push({
          created: item.created,
          status: item.status,
          offerId: item.offerId,
          user: item.offerId.user,
          transactionId: item.transactionId,
          blockCount: 0,
          trustCount: 0,
        });
      });
      for (const _item of data) {
        const BlockUsers = await User.find({
          _id: user_id,
          hasBlocked: _item.user._id,
        });
        _item.blockCount = BlockUsers.length;
        const TrustUsers = await User.find({
          _id: user_id,
          hasTrusted: _item.user._id,
        });
        _item.trustCount = TrustUsers.length;
      }
      res.status(200).json({
        status: "success",
        data: {
          data,
        },
      });
    } else
      next(
        new Error(
          "Unable to Find Recent Trades Or No Transactions perform yet!"
        )
      );
  } catch (error) {
    next(error);
  }
};

exports.blockedUser = async (req, res, next) => {
  const id = req.user._id;
  try {
    let docs = await Model.find({
      sellerId: id,
      status: "completed",
    }).populate({
      path: "offerId",
      populate: {
        path: "disLikes",
      },
    });
    if (!docs) {
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
        docs,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.fetchFavOffer = async (req, res, next) => {
  const id = req.user._id;
  try {
    let docs = await User.findById({
      _id: id,
    })
      .populate({
        path: "favorites",
        select: {
          tradingMethod: 1,
          offerLabel: 1,
          cryptoCurrencyType: 1,
          preferredCurrency: 1,
          tradingType: 1,
          createdAt: 1,
        },
      })
      .populate({
        path: "favorites",
        populate: {
          path: "user",
        },
      });

    if (!docs) {
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
        docs,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.lastWeekTransaction = async (req, res, next) => {
  try {
    let d = new Date(); // today!
    let x = 7;

    const docs = await Model.aggregate([
      {
        $match: {
          created: {
            $gte: new Date(d.setDate(d.getDate() - x)),
            $lte: new Date(),
          },
        },
      },
      {
        $lookup: {
          from: "offers",
          localField: "offerId",
          foreignField: "_id",
          as: "offer",
        },
      },
      {
        $match: {
          "offer.cryptoCurrencyType": { $eq: `${req.params.currency}` },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$created" },
            month: { $month: "$created" },
            day: { $dayOfMonth: "$created" },
          },
          amount: { $first: `$cryptoAmount` },
          created: { $first: "$created" },
          transactions: { $sum: 1 },
        },
      },
      {
        $addFields: {
          currency: `${req.params.currency}`,
        },
      },
      // { $unwind: '$offer.cryptoCurrencyType'},

      {
        $sort: {
          created: -1,
        },
      },
    ]);
    res.status(200).json({
      status: "success",
      data: {
        docs,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};
