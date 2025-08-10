const express = require("express");
const router = express.Router();

const checkoutController = require("../controllers/checkout");

router.post("/create-checkout-session", checkoutController.postCheckout);
router.get('/success', checkoutController.getSuccess)
router.get('/cancel', checkoutController.getCancel)
//Checking if this makes the checkout webhook accessible to stripe
router.post("/webhook", checkoutController.checkoutWebhook);


module.exports = router;