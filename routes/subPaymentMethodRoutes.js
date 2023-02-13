const express = require('express');
const router = express.Router();
const subPaymentMethodController = require('../controllers/paymentMethod/subPaymentMethodController');
const middleware = require('../middlewares/auth');

router.delete('/remove', subPaymentMethodController.deleteOne);
router.post('/create', subPaymentMethodController.createOne);
router.put('/update', subPaymentMethodController.updateOne);
router.get('/all', subPaymentMethodController.getAll);
router.get('/:id', subPaymentMethodController.list);

// Protect all routes after this middleware
router.use(middleware.protect);



// Only admin have permission to access for the below APIs
// router.use(authController.restrictTo('admin'));


module.exports = router;
