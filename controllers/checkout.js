const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/postSchema");
const mongoose = require("mongoose");


const stripe = require('../middleware/stripe');

module.exports = {
  postCheckout: async (req, res) => {
    try {
      const cart = req.body.cart
      // Get all product IDs
      const ids = Object.keys(cart)
      // Filter out malformed ObjectIds
      const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
      // Query DB for all products in the cart
      const products = await Post.find({ 
        _id: { $in: validIds }, 
        available: true 
      });
      const line_items = products.map(el=> {
        const prodID = el._id.toString()
        const clientQty = cart[prodID].quantity || 1
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: el.title, 
              images: [el.mainImageURL],
            },
            unit_amount: Math.round((el.price-el.discount)*100)
          },
          quantity: clientQty,
        }
      })
      const session = await stripe.checkout.sessions.create({
        line_items,
        mode: 'payment',
        automatic_tax: {enabled: true},
        shipping_address_collection: {
          allowed_countries: ['US'] // customize based on your shipping regions
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 1000, // $10.00 
                currency: 'usd',
              },
              display_name: 'Standard Shipping',
            }
          }
        ],
        success_url: `${process.env.MY_DOMAIN}checkout/success`,
        cancel_url: `${process.env.MY_DOMAIN}checkout/cancel`,
      })
      res.status(200).json({ url: session.url })
    } catch (err) {
      console.error('stripe checkout error:', err)
      res.status(500).json({error:'checkout session failed'})
    }
  },

  getSuccess: async (req, res) => {
    res.render('success.ejs'); // Express looks in views/success.ejs
  },
  
  getCancel: async (req, res) => {
    res.render('cancel.ejs'); // views/cancel.ejs
  },
};

