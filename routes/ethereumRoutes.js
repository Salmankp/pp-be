
const express = require('express');
const router = express.Router();
const ethController = require('../controllers/blockchain/ethController');
const authController = require('./../controllers/authController');
const middleware = require('../middlewares/auth');



// Protect all routes after this middleware
router.use(middleware.protect);
router.get('/create-wallet', ethController.createWallet);
router.post('/transfer', ethController.trasnferBalance);
router.get('/getBalance/:walletAddress', ethController.getAccountsBalance);
router.get('/track/:hash', ethController.transactionHash);

// Only admin have permission to access for the below APIs
// router.use(authController.restrictTo('admin'));


module.exports = router;
