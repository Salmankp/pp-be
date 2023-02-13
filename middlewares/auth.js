const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const {User} = require('../models/userModel');
const AppError = require('../utils/appError');

const protect = async (req, res, next) => {
  const token = (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
)? req.headers.authorization.split(' ')[1] : null;

  if (!token) {
    return next(
        new AppError(
            401,
            'fail',
            'You are not logged in! Please login in to continue',
        ),
        req,
        res,
        // next,
    );
  }
  try {
    //   Verify Token
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // check if the user is exist (not deleted)
    const user = await User.findById(decoded.id);
    if ( !user ) {
      return next(
        new AppError(401, 'fail', 'This user is no longer exist'),
        req,
        res,
        next,
      );
    }
    req.user = user;
    next();

  } catch (error) {
    next(error);
}
};


module.exports = {
    protect,
};
