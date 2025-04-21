const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const checkoutController = require("../controllers/checkout");



router.post("/create-checkout-session", checkoutController.postCheckout);
router.get('/success', checkoutController.getSuccess)
router.get('/cancel', checkoutController.getCancel)


module.exports = router;