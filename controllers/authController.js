const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const transport = require("../utils/mail");
const { User, schema } = require("../models/userModel");
const NotificationSettings = require("../models/notificationSettingModel");
const AppError = require("../utils/appError");
const { getOrSetCache } = require("../utils/redisConfig");
const Wallet = require("../models/walletModel");
const Web3EthAccounts = require("web3-eth-accounts");
const { authenticator } = require('otplib')
const QRCode = require('qrcode')
const crypto = require('crypto');
const ip = require("ip");

const createToken = (id, secretKey) => {
  return jwt.sign(
    {
      id,
    },
    secretKey,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

const loginLogic = async ({ user }) => {
  // await User.findByIdAndUpdate(user._id, { isActive: true, loginTime: new Date() });
  try {

    // 3) add logs login time
    await User.findByIdAndUpdate(
      user._id,
      {
        $set: { isActive: true, loginTime: new Date() },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    // 4) create wallet
    const walletData = await addWallet(user);

    // 5) All correct, send jwt to client
    const token = createToken(user.id, process.env.JWT_SECRET);

    // 6) Remove the password from the output
    user.password = undefined;

    // 7) add keys for notificationSettings
    let notificationSettings = await NotificationSettings.findOne({
      user: user._id,
    });
    if (notificationSettings == null) {
      notificationSettings = await NotificationSettings.create({
        user: user._id,
      });
    }

    await getOrSetCache("userInfo", user);

    return {
      token,
      data: {
        user,
        wallet: { ethWallet: walletData?.wallet?.public ?? "" },
        notificationSettings,
        ipAddress: ip.address()
      }
    }
  } catch (err) {
    throw new Error(err)
  }

}

exports.login = async (req, res, next) => {
  try {
    const { email, password, phoneNumber } = req.body;
    var queryParam = '';
    // 1) check if email and password exist
    if (!password) {
      return next(
        new AppError(400, "fail", "Please provide password"),
        req,
        res,
        next
      );
    }
    if (email) {
      const pattern = new RegExp(
        /^(("[\w-\s]+")|([+\w-]+(?:\.[+\w-]+)*)|("[\w-\s]+")([+\w-]+(?:\.[+\w-]+)*))(@((?:[+\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
      );
      if (!pattern.test(email)) {
        return next(
          new AppError(400, "fail", "invalid Email"),
          req,
          res,
          next
        );
      } else {
        queryParam = email;
      }
    } else if (phoneNumber) {
      const phonePattern = new RegExp(/^\+(?:[0-9]●?){6,14}[0-9]$/);
      if (!phonePattern.test(phoneNumber)) {
        return next(
          new AppError(400, "fail", "invalid phoneNumber"),
          req,
          res,
          next
        );
      } else {
        queryParam = phoneNumber;
      }
    } else {
      return next(
        new AppError(400, "fail", "Please provide PhoneNumber or Email"),
        req,
        res,
        next
      );
    }

    // 2) check if user exist and password is correct
    const user = await User.findOne({ $or: [{ email: queryParam }, { phoneNumber: queryParam }] }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(
        new AppError(401, "fail", `${email ? 'email' : 'phone number'} or Password is wrong`),
        req,
        res,
        next
      );
    } else {
      const loginInfo = await loginLogic({ user });
      res.status(200).json({
        status: "success",
        token: loginInfo?.token,
        data: loginInfo?.data,
      });

    }

  } catch (err) {
    next(err);
  }
};

exports.signup = async (req, res, next) => {
  try {
    const inputs = req.body;
    const { error, value } = schema.validate({
      ...inputs,
      name: createUniqueUserName(),
    });

    if (error) {
      return res.status(400).json(error?.details[0]?.message);
    }
    if(inputs.email && await User.findOne({ email: inputs.email })){
      return next(
        new AppError(400, "fail", "Email already exists"),
        req,
        res,
        next
      );
    } else if (inputs.phoneNumber && await User.findOne({ phoneNumber: inputs.phoneNumber })) {
      return next(
        new AppError(400, "fail", "Phone number already exists"),
        req,
        res,
        next
      );
    } else {
      const user = await User.create(value);
      const token = createToken(user.id, process.env.JWT_SECRET);
      user.password = undefined;
      ////////////////////////
      const message = {
        from: process.env.MAIL_AUTH_USER,
        to: user.email,
        subject: "P2P USER - Request Access",
        // text: `Doctor ${doctorUser.data.first_name} ${doctorUser.data.last_name} requested for access.`,
        html: `P2P ${user.name} requested for access. <br><br>
      <a href="${process.env.FRONTEND_APP_PATH}/grant-access/${user._id}/accepted">Accept</a> &nbsp;&nbsp;&nbsp;&nbsp; <a href="${process.env.FRONTEND_APP_PATH}/grant-access/${user._id}/rejected">Reject</a>`,
      };

      // const data = await transport.sendMail(message);
      // console.log("data: ", data);
      res.status(201).json({
        status: "success",
        token,
        data: {
          user,
        },
      });
    }

  } catch (err) {
    return res.status(400).json(err);

    next(err);
  }
};

exports.trustUserEmail = async (req, res, next) => {
  console.log(req.body._id);
  try {
    let doc = await User.findByIdAndUpdate(
      req.body._id,
      { $set: { isEmailVerified: true } },
      { new: true }
    );
    console.log(doc);
    return res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.logout = async (req, res, next) => {
  try {
    let doc = await User.findByIdAndUpdate(
      req.body._id,
      {
        $set: { isActive: false, lastSeenTime: new Date() },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    const time = moment(doc.lastSeenTime).fromNow();
    const loggedInTime = doc.loginTime;
    const loggedOutTime = doc.lastSeenTime;
    const d = Math.trunc((loggedOutTime - loggedInTime) / 1000);
    var h = Math.floor(d / 3600);
    var m = Math.floor((d % 3600) / 60);

    var hDisplay = h > 0 && h < 24 ? h + (h == 1 ? " hour" : " hours") : "";
    var mDisplay = m > 0 && h < 1 ? m + (m == 1 ? " min" : " mins") : "";
    doc = await User.findByIdAndUpdate(
      doc._id,
      {
        $set: { activeTime: hDisplay + mDisplay, lastSeen: time },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      status: "success",
      data: {
        doc,
      },
    });
  } catch (err) {
    next(err);
  }
};
exports.sendPasswordForgetEmail = async (req, res, next) => {
  try {
    let user;
    let { email, phoneNumber } = req.body;
    if(email){
      user = await User.findOne({
        email,
      });
    } else {
      user = await User.findOne({
        phoneNumber,
      });
    }
    if (!user)
      return res.status(404).json({
        status: "error",
        message: "User does not exist!",
      });
    const token = createToken(user._id, process.env.RESET_JWT_KEY);
    const message = {
      from: process.env.MAIL_AUTH_USER,
      to: user.email,
      subject: "P2P USER - Password Reset",
      // text: `Doctor ${doctorUser.data.first_name} ${doctorUser.data.last_name} requested for access.`,
      html: `P2P ${user.name} requested for password reset. <br><br>
    <a href="${process.env.FRONTEND_APP_PATH}/reset-password/${token}/accepted">Reset Password</a> &nbsp;&nbsp;&nbsp;&nbsp; `,
    };

    const data = await transport.sendMail(message);
    return res.status(200).json({
      status: "success",
      message: "Email Sent with reset instructions!",
      data: user
    });
  } catch (error) {
    next(error);
  }
};
exports.updateForgetPassword = async (req, res, next) => {
  let { reqIp, reqCity, reqCountry, reqBrowser, reqTime } = req.body;
  let { password, token } = req.body;
  try {
    const decode = await promisify(jwt.verify)(
      token,
      process.env.RESET_JWT_KEY
    );
    password = await bcrypt.hash(password, 12);
    const user = await User.findByIdAndUpdate(
      { _id: decode.id },
      {
        $set: {
          password,
          changePass: new Date(),
          reqIp,
          reqCity,
          reqCountry,
          reqBrowser,
          reqTime,
        },
      },
      { new: true }
    );
    if (user)
      return res.status(200).json({
        status: "success",
        message: "Password Reset",
        data: user
      });
    else
      return res.status(200).json({
        status: "error",
        message: "User not Found!",
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Internal Error Occured",
    });
  }
};
exports.resetPassword = async (req, res, next) => {
  try {
    let { email, currentPassword, newPassword } = req.body;
    const user = await User.findOne({
      email,
    }).select("+password");
    const oldPassword = user.password;
    var passwordIsValid = bcrypt.compareSync(currentPassword, oldPassword);
    if (!passwordIsValid) {
      return res.status(409).json({
        status: "error",
        message: "Current password in not correct",
        data: {
          user,
        },
      });
    }
    const password = await bcrypt.hash(newPassword, 12);
    const doc = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: { password, changePass: new Date() },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!doc) {
      res.send("error");
    }

    res.status(201).json({
      status: "success",
      message: "Password changed successfully",
      data: {
        doc,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.protect = async (req, res, next) => {
  try {
    // 1) check if the token is there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return next(
        new AppError(
          401,
          "fail",
          "You are not logged in! Please login in to continue"
        ),
        req,
        res,
        next
      );
    }

    // 2) Verify token
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) check if the user is exist (not deleted)
    const user = await User.findById(decode.id);
    if (!user) {
      return next(
        new AppError(401, "fail", "This user is no longer exist"),
        req,
        res,
        next
      );
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Authorization check if the user have rights to do this action
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.log("#####roles", req?.user?.role, roles);
      return next(
        new AppError(403, "fail", "You are not allowed to do this action"),
        req,
        res,
        next
      );
    }
    next();
  };
};

const createUniqueUserName = () => {
  return "_" + Math.random().toString(36).substr(2, 9);
}
const addWallet = async (user) => {
  const WalletDetail = await Wallet.findOne({ user: user._id }).select(
    "wallet.public"
  );

  console.log("wallet Exist:", WalletDetail);
  // ====== create new wallet  ========

  if (!WalletDetail) {
    let ResponseCode = 200;
    let ResponseMessage = ``;
    let ResponseData = null;
    try {
      let account = new Web3EthAccounts(
        "https://rinkeby.infura.io/v3/07b0f2fe4e234ceea0ff428f0d25326e"
      );

      let wallet = account.create();

      let walletAddress = wallet.address;
      // const count = await web3.eth.getTransactionCount(walletAddress);

      let date = new Date();
      let timestamp = date.getTime();

      ResponseData = {
        wallet: {
          private: wallet.privateKey,
          public: wallet.address,
          currency: "ETH",
          create_date: date,
          sent: 0,
          received: 0,
          link: `https://www.etherscan.io/account/${walletAddress}`,
        },
        message: "",
        timestamp: timestamp,
        status: 200,
        success: true,
      };

      const createWallet = await Wallet.create({
        user: user._id,
        wallet: { ...ResponseData.wallet },
      });
      return WalletDetail;
    } catch (error) {
      console.log(error, "error");
      ResponseMessage = `Transaction signing stops with the error ${error}`;
      ResponseCode = 400;
      return error
    ;
    }
  }else{
  return WalletDetail;
  }
  // ===== end wallet =======

}

exports.generateQR = async (req, res, next) => {
  try {
    const email = req.user.email;
    const secret = await authenticator.generateSecret();

    const user = await User.findById(req.user.id)
    const url = await QRCode.toDataURL(authenticator.keyuri(email, 'P2p', secret));
    const optpLoginToken = await user.createOpTpLoginToken();

    user.secret = secret;
    await user.save();

    res.status(201).json({ status: 'success', message: 'Secret generated successfully', data: { url, optpLoginToken, secret } });
  } catch (error) {
    next(error);

  }
};

exports.verifyOpTP = async (req, res, next) => {

  try {
    const code = req?.body?.code;
    const optpLoginToken = req?.body?.optpLoginToken;

    const hashedToken = crypto
      .createHash('sha256')
      .update(optpLoginToken)
      .digest('hex');

    const user = await User.findOne({
      optpLoginToken: hashedToken,
      opTpLoginTokenExpires: { $gt: Date.now() }
    });
    if (!code || !optpLoginToken || !user || !(verifyCode(code, user.secret))) {
      throw new Error('Invalid verification code or login token expired!');
    }

    user.optpLoginToken = undefined;
    user.opTpLoginTokenExpires = undefined;
    user.enable2FA = true;
    await user.save();

    const loginInfo = await loginLogic({ user });
    res.status(200).json({
      status: "success",
      token: loginInfo?.token,
      data: loginInfo?.data,
    });
  } catch (error) {
    next(error);
  }

};

exports.remove2FA = async (req, res, next) => {

  try {
    const user = await User.findById(req.user._id);
    user.secret = undefined;
    user.enable2FA = false;
    user.loginToken = undefined;
    user.loginTokenExpires = undefined;
    await user.save();
    res.status(200).json({ status: 'success', message: '2FA disabled successfully', data: {} });
  } catch (err) {
    next(err)
  }
};

const verifyCode = (code, secret) => {
  return !(!authenticator.check(code, secret));
}