const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethod/paymentMethodController');
const middleware = require('../middlewares/auth');


router.delete('/remove', paymentMethodController.deleteOne);
router.post('/create', paymentMethodController.createOne);
router.put('/update', paymentMethodController.updateOne);
router.get('/all', paymentMethodController.getAll);
router.get('/gift/all', paymentMethodController.giftAll);



// Protect all routes after this middleware
router.use(middleware.protect);



// Only admin have permission to access for the below APIs
// router.use(authController.restrictTo('admin'));


module.exports = router;
