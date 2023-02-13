const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet/walletController');
const middleware = require('../middlewares/auth');


router.delete('/remove', walletController.deleteOne);
router.post('/create', walletController.createOne);
router.put('/update', walletController.updateOne);
router.get('/all', walletController.getAll);
router.get('/:id', walletController.getOne);
// Protect all routes after this middleware
// router.use(middleware.middleware);



// Only admin have permission to access for the below APIs
// router.use(authController.restrictTo('admin'));


module.exports = router;
