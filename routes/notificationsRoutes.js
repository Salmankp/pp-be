const express = require("express");
const router = express.Router();
const notificationsRoutes = require("../controllers/notificationsController");
const middleware = require("../middlewares/auth");

// Protect all routes after this middleware
router.use(middleware.protect);

router.post("/addNotification", notificationsRoutes.addNotifications);
router.post("/userViewedNotifications", notificationsRoutes.userViewedNotifications);
// /api/chat/getChats
router.get("/getNotification", notificationsRoutes.getNotifications);
router.put("/readNotifications", notificationsRoutes.readNotifications);

module.exports = router;
