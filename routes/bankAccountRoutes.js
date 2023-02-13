const express = require("express");
const router = express.Router();
const bankAccountController = require("../controllers/bankAccountController");
const middleware = require('../middlewares/auth');



// Protect all routes after this middleware
router.use(middleware.protect);

// /api/chat/getChats
router.post('/addAccount', bankAccountController.addAccuont)
router.get('/getAccount', bankAccountController.getAccount);
router.get('/:id', bankAccountController.getAccountById);


module.exports = router;
