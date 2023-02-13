const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required:true
    },
    receiver: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required:true
    },
    message: {
      type: String,
      required:true
    },
    file: {
      type: String,
    },
    time: {
      type: String,
    },
    transaction: {
      type: mongoose.Types.ObjectId,
      ref: "Transaction",
      required:true
    },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
