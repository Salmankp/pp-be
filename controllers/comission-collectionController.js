const mongoose = require("mongoose");
const ComissionTrading = mongoose.model(
  "ComissionTrading",
  new mongoose.Schema({}, { collection: "components_comission_tradings" })
);

exports.getComission = async (req, res, next) => {
  try {
    const collection = await ComissionTrading.findOne();
    res.status(200).send({
      data: collection
    });
  } catch (error) {
    next(error);
  }
};
