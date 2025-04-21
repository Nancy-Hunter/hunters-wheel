const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/postSchema");

const stripe = require('../middleware/stripe');

module.exports = {
  postCheckout: async (req, res) => {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, price_1234) of the product you want to sell
          price: '{{PRICE_ID}}',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.MY_DOMAIN}/checkout/success`,
      cancel_url: `${process.env.MY_DOMAIN}/checkout/cancel`,
      automatic_tax: {enabled: true},
    });
  
    res.redirect(303, session.url);
  }, 

  getSuccess: async (req, res) => {
    res.render('success.ejs'); // Express looks in views/success.ejs
  },
  
  getCancel: async (req, res) => {
    res.render('cancel.ejs'); // views/cancel.ejs
  },
};

