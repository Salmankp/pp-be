const express = require("express");
const router = express.Router();
const transectionController = require("../controllers/transection/transectionController");
const authController = require("./../controllers/authController");
const middleware = require("../middlewares/auth");

// Protect all routes after this middleware
router.use(middleware.protect);

router.delete("/remove", transectionController.deleteOne);
router.post("/create", transectionController.createOne);
router.put("/update", transectionController.updateOne);
router.get("/all", transectionController.getAll);
router.get("/getWithTradingId/:id", transectionController.getWithTradingId);
router.get("/getOne/:page", transectionController.getOne);
router.get("/vendorData/:type", transectionController.vendorData);
router.get("/vendorTradeData/:id/:type", transectionController.vendorTradeData);
router.get("/totalTrades/:id", transectionController.totalTrades);
router.get("/successfullTrades", transectionController.successfullTrades);
router.get("/transPaymentMethods", transectionController.transPaymentMethods);
router.get("/vendorTrustedUser", transectionController.vendorTrustedUser);
router.get("/closingRatio", transectionController.closingRatio);
router.get("/topOffers", transectionController.topOffers);
router.get("/monthlyTotal", transectionController.monthlyTotal);
router.get("/getCancelledOffer", transectionController.getCancelledOffer);
router.get("/getExpiredOffer", transectionController.getExpiredOffer);
router.get("/recentTrades", transectionController.recentTrades);
router.get("/blockedUser", transectionController.blockedUser);
router.get("/fetchFavOffer", transectionController.fetchFavOffer);

router.post("/filterTrades", transectionController.filterTrades);

router.post("/paid", transectionController.paid);
router.post("/release", transectionController.release);
router.post("/dispute", transectionController.dispute);
router.post("/transferEscrow", transectionController.transferEscrow);
router.post("/transferBuyer", transectionController.transferBuyer);
router.get("/pendingTransaction", transectionController.pendingTransactionList);
router.get("/lastWeekTransactions/:currency", transectionController.lastWeekTransaction);

// Only admin have permission to access for the below APIs
router.use(authController.restrictTo("admin"));
router.post("/dispute/resolve", transectionController.resolveDispute);

module.exports = router;
