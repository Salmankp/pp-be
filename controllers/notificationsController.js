const NotificationSettings = require("../models/notificationSettingModel");
const Notifications = require("../models/notificationsModel");
const { io, liveConnectedUsers } = require("../socket");
const transport = require("../utils/mail");
exports.addNotifUtil = async req => {
  const response = { data: undefined, error: undefined };
  try {
    response.data = await Notifications.findOneAndUpdate(
      { transaction: req.body.transaction, user: req.body.user },
      { $set: req.body },
      { upsert: true, new: true }
    ).populate({
      path: "transaction",
      populate: [{ path: "offerId" }, { path: "buyerId" }, { path: "sellerId" }]
    });
    if (response.data) io.emit("notification-recieved", response.data);
  } catch (err) {
    response.error = err;
  }
  return response;
};
// exports.addNotifications = async (req, res, next) => {
//   const { data, error } = await this.addNotifUtil(req);

//   if (data) {
//     res.status(200).json({
//       status: "success",
//       data
//     });
//   } else
//     res.status(400).json({
//       status: "failed",
//       message: error
//     });
// };
exports.addNotifications = async (req, res, next) => {
  try {
    const notification = await Notifications.create({
      user: req?.body?.user,
      link: req?.body?.link,
      type: req?.body?.type,
      description: req?.body?.description
    })
    res.status(200).json({
      status: "success",
      data: notification
    });
  } catch (err) {
    next(err)
  }
};

exports.sendNotification = async (data) => {
  try {

    const settings = await NotificationSettings.findOne({ user: data?.receiver });
    let notification = '';
    let mail = '';
console.log('========');
    // setInterval(async () => {
      if (settings[data?.type].includes('web')) {
        notification = await Notifications.create({
          user: data?.receiver,
          link: data?.link,
          type: data?.type,
          description: data?.description
        });
        liveConnectedUsers[data?.receiver].emit('notification', notification)
        console.log('notification send=====>>>');
      }
      if (settings[data?.type].includes('email')) {
        const message = {
          from: process.env.MAIL_AUTH_USER,
          to: data.email,
          subject: data?.type,
          text: data?.description,
        };
        mail = await transport.sendMail(message);
        console.log('email send=====>>>');
      }
    // }, settings?.notificationTimeInterval || 0)
    // return {notification, mail};

  } catch (err) {
    console.log(err, '=====>>>');
    // next(err)
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notifications.find({
      user: req.user.id
    }).sort({ createdAt: -1 });
    const count = await Notifications.count({ user: req.user.id, isRead: false })
    if (notifications) {
      res.status(200).json({
        status: "success",
        data: { notifications, unread: count }
      });
    } else
      res.status(404).json({
        status: "failed",
        message: "Notifications Not Found"
      });

  } catch (err) {
    next(err);
  }
};

exports.readNotifications = async (req, res, next) => {

  try {
    const notifications = await Notifications.updateMany({
      user: req.user.id
    }, { isRead: true }, { new: true });
    res.status(200).json({
      status: "success",
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

exports.userViewedNotifications = async (req, res, next) => {

  try {
    await sendNotification({
      receiver: req.body.receiver,
      link: '',
      type: 'someoneViewedMyProfile',
      description: req.body.description
    })
  } catch (err) {
    next(err);
  }
};
