const { User } = require("../models/userModel");
const base = require("./baseController");
// const client = require("twilio")(
//   process.env.ACCOUNT_SID,
//   process.env.AUTH_TOKEN
// );
const { connection } = require("../services/kycServices");
const AppError = require("../utils/appError");
const { sendTwilioCode, verifyTwilioCode, sendCodeToEmail } = require("../helpers/2FA");
const { emailCodeGenerator } = require("../helpers/codeGenerator");
const Transaction = require("../models/transectionModel");
const transaction = require("../models/transectionModel");
const NotificationSettings = require("../models/notificationSettingModel");
const { sendNotification } = require("./notificationsController");
const ip = require("ip");

exports.deleteMe = async (req, res, next) => {
  try {
    const result = await User.findByIdAndUpdate(req.user._id, {
      active: false,
      isDeactivated: true,
    });
    if (result) {
      return res.status(200).json({
        status: "success",
        data: { deactivated: true },
      });
    } else {
      res.status(400).json({
        status: "failed",
        message: "Account could not be deleted",
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = base.getAll();
exports.getUser = base.getOne();

// Don't update password on this
exports.updateUser = base.updateOne();
exports.deleteUser = base.deleteOne();
exports.blockUser = base.blockUser();
exports.blockList = base.blockList();
exports.unBlockUser = base.unBlockUser();

exports.addFavorites = async (req, res, next) => {
  const user = req.user._id;
  const offer = req.body._id;
  if (!user || !offer) next(new Error("UserId or OfferId not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: user,
        favorites: { $ne: offer },
      },
      {
        $push: { favorites: offer },
      },
      {
        new: "true",
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update,
      });
    } else next(new Error("Unable to Find User Data or Already Favorited!"));
  } catch (err) {
    next(err);
  }
};

exports.removeFavorites = async (req, res, next) => {
  const user = req.user._id;
  const offer = req.body._id;
  if (!user || !offer) next(new Error("UserId or OfferId not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: user,
        favorites: offer,
      },
      {
        $pull: { favorites: offer },
      },
      {
        new: "true",
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update,
      });
    } else next(new Error("Unable to Find User or Not Favorited!"));
  } catch (err) {
    next(err);
  }
};
exports.enrollUser = async (req, res, next) => {
  //required parameters { req.body.base64Image, req.user.id, req.body.name,  first_name: 'KUKU',
  // last_name: 'KUKU',
  // country: 'KE',
  // id_type: 'NATIONAL_ID',
  // id_number: '00000000',
  // dob: "2002-12-31", // yyyy-mm-dd
  // entered: "true" // must be a string }
  let partner_params = {
    job_id: Date.now().toString(),
    user_id: req?.user?.id,
    job_type: 4,
  };
  let image_details = [
    {
      image_type_id: 2,
      image: req.body.base64Image,
    },
  ];
  const [first_name, last_name] = req?.body?.user_name?.split(" ");
  let id_info = {
    first_name: first_name,
    last_name: last_name,
    country: "KE",
    id_type: "NATIONAL_ID",
    id_number: "00000000",
    dob: req?.body?.user_dob, // yyyy-mm-dd
    entered: "true", // must be a string
  };

  let options = {
    return_job_status: true,
    return_history: true,
    return_image_links: true,
    signature: true,
  };
  let enrolled = true;
  const go = async () => {
    try {
      response = await connection.submit_job(
        partner_params,
        image_details,
        id_info,
        options
      );

      response.result.ResultCode !== "0840" && (enrolled = false);

      res.send(response);
    } catch (error) {
      error.message.slice(0, 4) !== "2209" && (enrolled = false);
      res.status(404).send({ error: error.message });
    }
    const doc = await User.findByIdAndUpdate(
      req.user.id,
      { enrolled },
      {
        new: true,
      }
    );
  };
  go();
};

exports.verifyUser = async (req, res, next) => {
  //required parameters { req.body.base64Image, req.user.id }
  let partner_params = {
    job_id: Date.now().toString(),
    user_id: req.user.id,
    job_type: 2,
  };
  let image_details = [
    {
      image_type_id: 2,
      image: req.body.base64Image,
    },
  ];

  let options = {
    return_job_status: true,
    return_history: true,
    return_image_links: true,
    signature: true,
  };
  let verified = true;
  const go = async () => {
    try {
      response = await connection.submit_job(
        partner_params,
        image_details,
        {},
        options
      );
      response.result.ResultCode !== "0820" && (verified = false);

      res.send(response);
      // res.write(JSON.stringify(response));
    } catch (error) {
      verified = false;
      res.status(404).send({ error: error.message });
      // res.end();
    }

    console.log("verified: ", verified);
    const doc = await User.findByIdAndUpdate(
      req.user.id,
      { verified },
      {
        new: true,
      }
    );
  };
  go();
};
exports.documentVerification = async (req, res, next) => {
  //required parameters { selfieImage, frontIDImage, backIdImage, country, id_type, id_number, firstName, lastName }

  let partner_params = {
    job_id: Date.now().toString(),
    user_id: req.user.id,
    job_type: 6,
  };
  let image_details = [
    {
      image_type_id: 2,
      image: req.body.selfieImage, // selfie of user
    },
    {
      image_type_id: 3,
      image: req.body.frontIDImage, // front of ID Document
    },
    {
      image_type_id: 7,
      image: req.body.backIdImage, // back of ID Document
    },
  ];

  let id_info = {
    country: req.body.country, //'<2-letter country code>', // The country where ID document was issued
    id_type: req.body.id_type, // ['DRIVERS_LICENSE', 'VOTER_ID', 'PASSPORT', 'NATIONAL_ID', The ID document type,
  };

  let options = {
    return_job_status: true,
    return_history: true,
    return_image_links: true,
    signature: true,
  };
  let verified = true;
  const go = async () => {
    console.log(partner_params);
    try {
      response = await connection.submit_job(
        partner_params,
        image_details,
        id_info,
        options
      );
      response?.result?.ResultCode !== "0810" && (verified = false);

      res.send(response);
      // res.write(JSON.stringify(response));
    } catch (error) {
      verified = false;
      res.status(404).send({ error: error.message });
    }

    if (verified) {
      const data = await User.findByIdAndUpdate(
        req.user.id,
        { verified },
        {
          new: true,
        }
      );
      console.log(data);
    }
  };
  go();
};

exports.hasBlocked = async (req, res, next) => {
  const blockedByUserId = req.user._id;
  const blockedUserId = req.body._id;
  if (!blockedByUserId || !blockedUserId)
    next(new Error("UserId or Blocked User Id not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: blockedByUserId,
        hasBlocked: { $ne: blockedUserId },
      },
      {
        $push: { hasBlocked: blockedUserId },
      },
      {
        new: "true",
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update,
      });
    } else next(new Error("Unable to Blocked User or Already Blocked!"));
  } catch (err) {
    next(err);
  }
};

exports.blockedBy = async (req, res, next) => {
  const user = req.params.id;
  const blockedByUserId = req.body._id;
  if (!user || !blockedByUserId)
    next(new Error("UserId or Blocked By User Id not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: user,
        blockedBy: { $ne: blockedByUserId },
      },
      {
        $push: { blockedBy: blockedByUserId },
        blockedTime: req.body.time,
      },
      {
        new: "true",
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update,
      });
    } else next(new Error("Unable to find Blocked By Users"));
  } catch (err) {
    next(err);
  }
};

exports.unBlocked = async (req, res, next) => {
  const unblockedByUserId = req.user._id;
  const unblockedUserId = req.body._id;
  if (!unblockedByUserId || !unblockedUserId)
    next(new Error("UserId or Blocked User Id not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: unblockedByUserId,
        hasBlocked: unblockedUserId,
      },
      {
        $pull: { hasBlocked: unblockedUserId },
      },
      {
        new: "true",
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update,
      });
    } else next(new Error("Unable to UnBlocked User or Already UnBlocked!"));
  } catch (err) {
    next(err);
  }
};

exports.removeBlockedBy = async (req, res, next) => {
  const user = req.params.id;
  const removeblockedByUserId = req.body._id;
  if (!user || !removeblockedByUserId)
    next(new Error("UserId or Blocked By User Id not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: user,
        blockedBy: removeblockedByUserId,
      },
      {
        $pull: { blockedBy: removeblockedByUserId },
      },
      {
        new: "true",
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update,
      });
    } else next(new Error("Unable to find Blocked By Users"));
  } catch (err) {
    next(err);
  }
};
exports.findBlock = async (req, res, next) => {
  const user = req.params.id;
  const blockedUserId = req.params.Id;
  if (!user || !blockedUserId)
    next(new Error("UserId or Blocked By User Id not provided"));
  try {
    const doc = await User.find({
      _id: user,
      hasBlocked: blockedUserId,
    });
    if (doc) {
      res.status(200).json({
        status: "success",
        data: doc,
      });
    } else next(new Error("Unable to find Blocked By Users"));
  } catch (err) {
    next(err);
  }
};

exports.findBlockedUsers = async (req, res, next) => {
  const user = req.user._id;
  if (!user) next(new Error("UserId not provided"));
  try {
    const doc = await User.find({
      _id: user,
    }).populate("hasBlocked");
    if (doc) {
      res.status(200).json({
        status: "success",
        data: doc,
      });
    } else next(new Error("Unable to find Blocked Users"));
  } catch (err) {
    next(err);
  }
};

exports.hasTrusted = async (req, res, next) => {
  const trustedByUserId = req.user._id;
  const trustedUserId = req.body._id;
  if (!trustedByUserId || !trustedUserId)
    next(new Error("UserId or Trusted User Id not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: trustedByUserId,
        hasTrusted: { $ne: trustedUserId },
      },
      {
        $push: { hasTrusted: trustedUserId },
      },
      {
        new: "true",
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update,
      });
    } else next(new Error("Unable to Trust User or Already Trusted!"));
  } catch (err) {
    next(err);
  }
};

exports.trustedBy = async (req, res, next) => {
  const user = req.params.id;
  const trustedByUserId = req.body._id;
  if (!user || !trustedByUserId)
    next(new Error("UserId or Trusted By User Id not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: user,
        trustedBy: { $ne: trustedByUserId },
      },
      {
        $push: { trustedBy: trustedByUserId },
        trustedTime: req.body.time,
      },
      {
        new: "true",
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update,
      });
    } else next(new Error("Unable to find Trusted By Users"));
  } catch (err) {
    next(err);
  }
};

exports.unTrust = async (req, res, next) => {
  const trustedByUserId = req.user._id;
  const trustedUserId = req.body._id;
  if (!trustedByUserId || !trustedByUserId)
    next(new Error("UserId or trusted User Id not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: trustedByUserId,
        hasTrusted: trustedUserId,
      },
      {
        $pull: { hasTrusted: trustedUserId },
      },
      {
        new: "true",
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update,
      });
    } else next(new Error("Unable to UnTrusted User or Already UnTrusted!"));
  } catch (err) {
    next(err);
  }
};

exports.removeTrustedBy = async (req, res, next) => {
  const user = req.params.id;
  const removetrustedByUserId = req.body._id;
  if (!user || !removetrustedByUserId)
    next(new Error("UserId or Trusted By User Id not provided"));
  try {
    const update = await User.findOneAndUpdate(
      {
        _id: user,
        trustedBy: removetrustedByUserId,
      },
      {
        $pull: { trustedBy: removetrustedByUserId },
      },
      {
        new: "true",
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update,
      });
    } else next(new Error("Unable to find Trusted By Users"));
  } catch (err) {
    next(err);
  }
};

exports.findTrust = async (req, res, next) => {
  const user = req.params.id;
  const trustedUserId = req.params.Id;
  if (!user || !trustedUserId)
    next(new Error("UserId or Trusted By User Id not provided"));
  try {
    const doc = await User.find({
      _id: user,
      hasTrusted: trustedUserId,
    });
    if (doc) {
      res.status(200).json({
        status: "success",
        data: doc,
      });
    } else next(new Error("Unable to find Trusted Users"));
  } catch (err) {
    next(err);
  }
};

exports.findTrustedUsers = async (req, res, next) => {
  const user_id = req.user._id;
  let data = [];
  if (!user_id) next(new Error("UserId not provided"));
  try {
    let doc = await User.find({
      _id: user_id,
    }).populate("hasTrusted");
    if (doc && doc.length) {
      doc.forEach((item) => {
        item.hasTrusted.forEach((el) => {
          data.push({ hasTrusted: el, tradesCount: 0 });
        });
      });
      for (const _item of data) {
        const trades = await Transaction.find({
          $or: [
            {
              buyerId: _item.hasTrusted._id,
              sellerId: user_id,
            },
            {
              sellerId: _item.hasTrusted._id,
              buyerId: user_id,
            },
          ],
        });
        _item.tradesCount = trades.length;
      }
      res.status(200).json({
        status: "success",
        data: data,
      });
    } else next(new Error("Unable to find Trusted Users"));
  } catch (err) {
    next(err);
  }
};

exports.findReferencedUsers = async (req, res, next) => {
  const userId = req.user._id;
  let data = [];
  if (!userId) next(new Error("UserId not provided"));
  try {
    const doc = await User.find({
      _id: userId,
    }).populate("referenceUser");
    if (doc && doc.length) {
      doc.forEach((item) => {
        item.referenceUser.forEach((el) => {
          data.push({ user: el, lastTrade: "" });
        });
      });
      console.log("data", data);
      for (const _item of data) {
        const trades = await transaction
          .find({
            $or: [
              {
                buyerId: _item.user._id,
              },
              {
                sellerId: _item.user._id,
              },
            ],
          })
          .sort({ created: -1 })
          .limit(5)
          .populate({
            path: "offerId",
            populate: {
              path: "user",
            },
          });
        _item.lastTrade = trades;
      }
      res.status(200).json({
        status: "success",
        data: data,
      });
    } else next(new Error("Unable to find Referenced Users"));
  } catch (err) {
    next(err);
  }
};

exports.notificationSetting = async (req, res, next) => {
  try {

    await sendNotification({
      receiver: req.user._id,
      link: 'http://localhost:3000/settings',
      type: 'bitcoinPriceChange',
      description: 'Bitcoin price has been changed'
    })

    const user_id = req.user._id;
    const params = req.body;
    await NotificationSettings.findOneAndUpdate(
      {
        user: user_id,
      },
      params,
      {
        upsert: "true",
        new: "true",
      },
      function (err, doc) {
        if (err) return next(err);
        res.status(200).json({
          status: "success",
          data: null,
        });
      }
    );
  } catch (error) {
    next(error);
  }
};

exports.checkPhoneNumber = async (req, res, next) => {
  try {
    const user_id = req.user._id;
    const { phoneNumber } = req.body;
    const user = await User.findOne({ _id: user_id });
    if (phoneNumber == user.phoneNumber) {
      res.status(200).json({
        status: "success",
        data: { verified: true },
      });
    } else {
      res.status(400).json({
        status: "failed",
        message: "Invalid phone number provided",
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.findRecentTrustedUsers = async (req, res, next) => {
  const user_id = req.user._id;
  let data = [];
  if (!user_id) next(new Error("UserId not provided"));
  try {
    const doc = await User.find({
      _id: user_id,
    })
      .populate("hasTrusted")
      .limit(5);
    if (doc) {
      res.status(200).json({
        status: "success",
        data: doc,
      });
    } else next(new Error("Unable to find Trusted Users"));
  } catch (err) {
    next(err);
  }
};

exports.sendVerificationCode = async (req, res, next) => {
  try {
    let { phoneNumber, email } = req.body;
    if(email) {
      const code = emailCodeGenerator();
      const update = await User.findOneAndUpdate(
        { email: email },
        { verifyEmailCode: code },
        { new: "true" }
      );
      if(update){
        await sendCodeToEmail(email, code);
      }
      res.status(200).json({
        status: "success",
        message: "Code sent successfully",
        data: {
          status: "success"
        }
      })
    } else {
      const response = await sendTwilioCode(phoneNumber);
      res.status(200).json({
        status: "success",
        data: response
      })
    }
  } catch (err) {
  next(err);
  } 
};

exports.verify2FACode = async (req, res, next) => {
  try {
    let { phoneNumber, email, code } = req.body;
    if(email) {
      const verify = await User.findOneAndUpdate(
        { email,
          verifyEmailCode: code
        },
        { isEmailVerified: true,
          verifyEmailCode: null
        }
      );
      if(verify){
        res.status(200).json({
          status: "success",
          message: "Code verified successfully",
          data: {
            status: "success"
          }
        })
      } else {
        res.status(400).json({
          status: "error",
          message: "Invalid Code",
          data: {
            status: "error"
          }
        })
      }
    } else {
      const response = await verifyTwilioCode(phoneNumber, code);
      if(response && response.status === "approved") {
        const formatPhone = phoneNumber.replace(/\s+/g, '')
          await User.findOneAndUpdate(
          { phoneNumber: formatPhone },
          { isPhoneVerified: true }
        );
      }
      res.status(200).json({
        status: "success",
        data: response
      })
    }
  } catch (err) {
    next(err);
  } 
};

exports.addPhoneEmailWith2FACode = async (req, res, next) => {
  try {
    let { userId, email, phoneNumber } = req.body;
    if(email) {
      const checkUser = await User.findOne({email});
      if(checkUser){
        res.status(400).json({
          status: "error",
          message: "Email already exists"
        })
      } else {
        const code = emailCodeGenerator();
        const update = await User.findByIdAndUpdate(
          userId ,
          { email,
            verifyEmailCode: code
           }
        );
        if(update){
          await sendCodeToEmail(email, code);
          res.status(200).json({
            status: "success",
            message: "Verification code sent to email"
          })
        }
      }
    } else {
      const formatPhone = phoneNumber.replace(/\s+/g, '');
      const checkUser = await User.findOne({phoneNumber: formatPhone});
      if(checkUser){
        res.status(400).json({
          status: "error",
          message: "Phone Number already exists"
        })
      } else {
        await User.findByIdAndUpdate(
          userId ,
          { phoneNumber: formatPhone }
        );
        const response = await sendTwilioCode(phoneNumber);
        res.status(200).json({
          status: "success",
          data: response
        })
      }
    }
  } catch (err) {
    next(err);
  } 
};

exports.activeSession = async (req, res, next) => {
  try {
    let { session } = req.body;
    let data;
    session.signedIn = new Date(); 
    session.ipAddress = ip.address(); 
      data = await User.findOneAndUpdate(
        { _id: req.params.userId, 'activeSessions.ipAddress': ip.address(), 'activeSessions.browser': session.browser },
        { $set: { 
          'activeSessions.$.signedIn': new Date(),
          'activeSessions.$.browser': session.browser,
          'activeSessions.$.country': session.country,
          'activeSessions.$.city': session.city,
          'activeSessions.$.ipAddress': session.ipAddress
          } 
        }
      );
      if(!data) {
        data = await User.findByIdAndUpdate(
          req.params.userId,
          { $push: { activeSessions: session } }
        );
      }
     res.status(200).json({
      status: "success",
      data
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteActiveSession = async (req, res, next) => {
  try {
    const deleteSession = await User.findByIdAndUpdate(
        req.params.userId,
        { "$pull": { "activeSessions": { "_id":  req.params.sessionId } }},
        { safe: true, multi: true }
      );
    if(deleteSession) {
     res.status(200).json({
      status: "success",
      message: "Session deleted successfully"
    });
    }
  } catch (error) {
    next(error);
  }
}

exports.userActivity = async (req, res, next) => {
  try {
    let { activity } = req.body;
    if(!activity.ipAddress) {
      activity.ipAddress = ip.address();
    }
    const data = await User.findByIdAndUpdate(
      req.params.userId,
      { 
        $push: { userActivities: activity }
      }
    );
    if(data) {
     res.status(200).json({
      status: "success",
      message: "Activities updated successfully"
    });
    }
  } catch (error) {
    next(error);
  }
}
