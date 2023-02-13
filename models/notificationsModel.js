const mongoose = require("mongoose");

const notifications = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    type:{
      type: String,
      required: true
    },
    link:{
      type: String,
      default: ''
    },
    description:{
      type: String,
      required: true
    },
    isRead:{
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Notifications = mongoose.model("Notifications", notifications);
module.exports = Notifications;
