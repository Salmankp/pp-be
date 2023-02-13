const Block = require("../models/blockModel");
const { User } = require("../models/userModel");
const AppError = require("../utils/appError");

exports.Block = async (req, res, next) => {
  const user = req.params.id;
  const blockedUserId = req.body._id;
  const value = {
    blockedByUserId: user,
    blockedUser: blockedUserId  
  }

  if (!user || !blockedUserId) next(new AppError("UserId or Blocked User Id not provided"));
  try {
    const doc = await Block.find(
      value
    );
    if(doc.length){
      next(new AppError("Already Blocked!"));
    }else {
      const data = await Block.create(value);
      res.status(200).json({
        status: "success",
        data: data
      });
    }

  } catch (err) {
    next(err);
  }
};
exports.blockedBy = async (req, res, next) => {
  const user = req.params.id;
  console.log('id',user);
  if (!user) next(new AppError("UserId  not provided"));
  try {
    const update = await Block.find(
      {
        blockedUser: user,
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update.length
      });
    } else next(new AppError("Unable to find user"));
  } catch (err) {
    next(err);
  }
};
exports.hasBlocked = async (req, res, next) => {
  const user = req.params.id;
  if (!user) next(new AppError("UserId not provided"));
  try {
    const update = await Block.find(
      {
        blockedByUserId: user,
      }
    );
    if (update) {
      res.status(200).json({
        status: "success",
        data: update.length
      });
    } else next(new AppError("Unable to find user"));
  } catch (err) {
    next(err);
  }
};
exports.findBlock = async (req, res, next) => {
  const user = req.params.id;
  const blockedUserId = req.params.Id;
  if (!user || !blockedUserId) next(new AppError("UserId or Blocked User Id not provided"));
  try {
    const doc = await Block.find(
      {
        blockedByUserId: user,
        blockedUser: blockedUserId  
      }
    );
    if(doc.length) {
      res.status(200).json({
        status: "success",
        data: doc.length
      });
    }

  } catch (err) {
    next(err);
  }
};

