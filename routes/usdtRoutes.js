const express = require('express');
const router = express.Router();
const usdtController = require('../controllers/blockchain/usdtController');
const authController = require('./../controllers/authController');
const middleware = require('../middlewares/auth');



// Protect all routes after this middleware
router.use(middleware.protect);
router.get('/getBalance/:walletAddress', usdtController.GetAccountsBalance);

module.exports = router;
