const express = require("express");
const router = express.Router();
const offerTagsController = require("../controllers/offerTagsController");

router.post("/addTags", offerTagsController.addTags);
// /api/chat/getChats
router.get("/getTags", offerTagsController.getTags);

module.exports = router;
