const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/postSchema");

module.exports = {
  getCategory: async (req, res) => {
    try {
      const posts = await Post.find({ category: req.params.theme });
      res.render("category.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getDeals: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("deals.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      res.render("post.ejs", { post: post });
    } catch (err) {
      console.log(err);
    }
  },
  getCart: async (req, res) => {
    try {
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("cart.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
};

