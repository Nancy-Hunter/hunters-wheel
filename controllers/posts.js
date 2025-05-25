const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/postSchema");
const mongoose = require("mongoose");

module.exports = {
  getCategory: async (req, res) => {
    try {
      const posts = await Post.find({ category: req.params.theme }).sort({ favorite: -1 });
      res.render("category.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getDeals: async (req, res) => {
    try {
      const posts = await Post.find().sort({ favorite: -1 }).lean();
      res.render("deals.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.id);
      if(!post) {
        return res.status(404).render('404', {title:"Not Found"})
      }
      res.render("post.ejs", { post: post });
    } catch (err) {
      console.log(err);
      next(err)
    }
  },
  getCart: async (req, res) => {
    try {
      const posts = await Post.find().sort({ favorite: -1 }).lean();
      res.render("cart.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  verifyProduct: async (req,res) => {
    try {
      const cart = req.body.cart || {};

      // Get all product IDs
      const ids = Object.keys(cart);
      // Filter out malformed ObjectIds
      const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
      // Query DB for all products in the cart
      const products = await Post.find({ 
        _id: { $in: validIds }, 
        available: true 
      });
  
      // Construct verified cart object (use product ID as key)
      const verifiedItems = {};
  
      products.forEach(prod => {
        const idStr = prod._id.toString()
        verifiedItems[idStr] = {
          id : idStr,
          productTitle: prod.title,
          price: prod.price,
          discount: prod.discount,
          image: prod.mainImageURL,
          qty: prod.quantity, // keep client's selected qty
        };
      });
      
      res.json( verifiedItems );
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: "Failed to verify cart" });
    }
  },
};

