const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/postSchema");

module.exports = {
  getIndex: async (req, res) => {
    try {
      const posts = await Post.find().sort({  favorite: -1 })
      res.render("index.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getAbout: async (req, res) => {
    try {
      const posts = await Post.find().sort({  favorite: -1 })
      res.render("about.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
};