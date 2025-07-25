const express = require("express");
const router = express.Router();

const checkoutController = require("../controllers/checkout");

router.post('/webhook', express.raw({type: 'application/json'}), checkoutController.checkoutWebhook)

module.exports = router; 