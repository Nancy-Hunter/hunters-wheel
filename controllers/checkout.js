const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/postSchema");
const mongoose = require("mongoose");

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_CLI; // from Stripe dashboard
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
        metadata: {
          cart: JSON.stringify(cart),
        },
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


  //WEBHOOK
  checkoutWebhook: async (req, res) => {
    console.log("Top of checkoutWebhook!")
    console.log("Contents of checkoutWebhook's req: " + JSON.stringify(req, null, 4))
    console.log("Contents of checkoutWebhook's res: " + JSON.stringify(res, null, 4))
    const sig = req.headers['stripe-signature'];

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const metadataCart = session.metadata?.cart;

      if (!metadataCart) {
        console.error('Cart metadata missing in session');
        return res.status(400).send('Missing cart data');
      }

      let cart;
      try {
        cart = JSON.parse(metadataCart);
      } catch (err) {
        console.error('Failed to parse cart JSON:', err);
        return res.status(400).send('Invalid cart data');
      }

      try {
        const productIds = Object.keys(cart).filter(id => mongoose.Types.ObjectId.isValid(id));

        // Fetch all products
        const products = await Post.find({ _id: { $in: productIds } });

        // Loop through and update inventory
        for (const product of products) {
          const prodId = product._id.toString();
          const purchasedQty = cart[prodId]?.quantity || 0;

          if (purchasedQty > 0) {
            product.quantity = (product.quantity || 0) - purchasedQty;
            if (product.quantity <= 0) {
              product.quantity = 0;
              product.available = false;
            }
            await product.save();
          }
        }

        res.status(200).send('Inventory updated');
      } catch (err) {
        console.error('Database update error:', err);
        res.status(500).send('Internal server error');
      }
    } else {
      // Unexpected event type
      res.status(200).send('Event received');
    }
  }

}

