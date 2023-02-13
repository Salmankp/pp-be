const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const middleware = require('../middlewares/auth');




// Protect all routes after this middleware
router.use(middleware.protect);
router.delete('/remove', feedbackController.deleteOne);
router.post('/create', feedbackController.createOne);
router.put('/update', feedbackController.updateOne);
router.get('/:id', feedbackController.getOne);
router.get('/', feedbackController.getAll);
router.get('/transFeedbacks/:id',feedbackController.getTransactionFeedBacks);
router.get('/userFeedbacks/:id',feedbackController.getUserFeedBacks);
router.get("/offerfeedbacks/:id", feedbackController.getOfferFeedBacks);
// Only admin have permission to access for the below APIs
// router.use(authController.restrictTo('admin'));


module.exports = router;
