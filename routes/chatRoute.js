const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");


// /api/chat/getChats
router.post('/uploadFiles', chatController.multerRoute)
router.get('/getChats/:transactionId', chatController.getChat);

module.exports = router;
