const express = require('express');
const router = express.Router();
const ethEscrowController = require('../controllers/blockchain/ethEscrowController');
const middleware = require('../middlewares/auth');



// Protect all routes after this middleware
router.use(middleware.protect);
router.post('/set-user', ethEscrowController.setUser);
router.get('/delivery-eth', ethEscrowController.deliveryEth);
router.get('/getBalance/:walletAddress', ethEscrowController.getBalance);
router.get('/deposit-eth', ethEscrowController.depositEth);
router.get('/dispute-eth', ethEscrowController.disputeEth);


// Only admin have permission to access for the below APIs
// router.use(authController.restrictTo('admin'));


module.exports = router;
