const express = require("express");
const router = express.Router();
const offerController = require("../controllers/offerController");
const authController = require("./../controllers/authController");
const middleware = require("../middlewares/auth");
const userController = require("../controllers/userController");

// Protect all routes after this middleware
router.use(middleware.protect);
router.post("/create-offer", offerController.createOffer);
router.put("/update-offer", offerController.updateOffer);
router.put("/add-like", offerController.addLike);
router.put("/remove-like", offerController.removeLike);
router.put("/update-cancel", offerController.updateCancel);
router.put("/updateExpired", offerController.updateExpired);

router.put("/add-disLike", offerController.addDisLike);
router.put("/remove-disLike", offerController.removedisLike);

router.get("/get-offers/:page", offerController.getOffers);
router.get("/gift-offers", offerController.giftCardOffer);
router.get("/:id", offerController.getOne);

router.get("/getUserAllOffer/:id", offerController.getUserAllOffer);
router.get("/getUserAllOfferBuy/:id", offerController.getUserAllOfferBuy);
router.get("/getUserAllOfferSell/:id", offerController.getUserAllOfferSell);
router.get("/getByPymentId/:id", offerController.getByPaymentId);
router.post("/offer_gift_card_image", offerController.uploadPaymentCardImage, offerController.resizePaymentCardImage);

// Only admin have permission to access for the below APIs
// router.use(authController.restrictTo('admin'));


module.exports = router;
