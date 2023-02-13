const express = require("express");
const router = express.Router();
const comissionController = require("../controllers/comission-collectionController");

router.get("/", comissionController.getComission);

module.exports = router;
