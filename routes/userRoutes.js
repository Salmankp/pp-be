const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authController = require("./../controllers/authController");
const middleware = require("../middlewares/auth");

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/resetPassword/:id", authController.resetPassword);
router.post("/sendForgetEmail", authController.sendPasswordForgetEmail);
router.post("/updateForgetPass", authController.updateForgetPassword);
router.route("/").get(userController.getAllUsers);

// Protect all routes after this middleware
router.put("/block", userController.blockUser);
router.put("/unblock", userController.unBlockUser);
router.get("/block-list", userController.blockList);
router.post("/logout", authController.logout);
router.post("/emailVerify", authController.trustUserEmail);

router.post('/sendVerificationCode', userController.sendVerificationCode);
router.post('/verify2FACode', userController.verify2FACode);

router.post('/userActivity/:userId', userController.userActivity);

router.use(middleware.protect);

router.post('/activeSession/:userId', userController.activeSession);
router.delete('/activeSession/:userId/:sessionId', userController.deleteActiveSession);

router.post('/addPhoneEmail2FACode', userController.addPhoneEmailWith2FACode);

router.get("/generate-qr", authController.generateQR);
router.get("/remove-2fa", authController.remove2FA);
router.post("/verify-optp", authController.verifyOpTP);

router.put("/add-favorites", userController.addFavorites);
router.put("/remove-favorites", userController.removeFavorites);
router.put("/hasBlocked", userController.hasBlocked);
router.put("/blockedBy/:id", userController.blockedBy);
router.put("/unBlocked", userController.unBlocked);
router.put("/removeBlockedBy/:id", userController.removeBlockedBy);
router.get("/findBlock/:id/:Id", userController.findBlock);
router.get("/findBlockedUsers", userController.findBlockedUsers);
router.put("/hasTrusted", userController.hasTrusted);
router.put("/trustedBy/:id", userController.trustedBy);
router.put("/unTrust", userController.unTrust);
router.put("/removeTrustedBy/:id", userController.removeTrustedBy);
router.get("/findTrust/:id/:Id", userController.findTrust);
router.get("/findTrustedUsers", userController.findTrustedUsers);
router.get("/findRecentTrustedUsers", userController.findRecentTrustedUsers);
router.get("/findReferencedUsers",userController.findReferencedUsers);

router
  .route("/:id")
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

router.route("/").get(userController.getAllUsers);
// Only admin have permission to access for the below APIs
// router.use(authController.restrictTo('admin'));
router.put("/block/account", userController.blockUser);

router.put("/unblock/account", userController.unBlockUser);
router.get("/blocklist/accounts", userController.blockList);

router.post("/deleteMe", userController.deleteMe);

router.post("/enrollUser", userController.enrollUser);
router.post("/verifyUser", userController.verifyUser);
router.post("/documentVerification", userController.documentVerification);
router.post("/notificationSetting", userController.notificationSetting);
router.post("/checkPhoneNumber", userController.checkPhoneNumber);

module.exports = router;
