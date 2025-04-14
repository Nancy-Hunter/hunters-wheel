const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/postSchema");

module.exports = {
  getIndex: async (req, res) => {
    try {
      const posts = await Post.find().sort({  createdAt: "desc" })
      res.render("index.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
};