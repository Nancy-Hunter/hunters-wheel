const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/postSchema");


module.exports = {
  // get request for admin profile page 
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find().sort( { createdAt: "desc" } );
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  //creates document in MongoDB for product 
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const imageUploadResults = []

      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path)
        imageUploadResults.push ( {
          url: result.secure_url, 
          cloudinaryId: result.public_id,
        })
      }

      await Post.create({
        title: req.body.title,
        images: imageUploadResults,
        caption: req.body.caption,
        cartCount: 0,
        price: req.body.price,
        quantity: req.body.quantity,
        available: true,
        favorite: req.body.onSale == "true" ? true : false,
        onSale: req.body.onSale == "true" ? true : false,
        discount: req.body.discount,
        category: req.body.category,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/admin/profile");
    } catch (err) {
      console.log(err);
    }
  },

  updatePost: async (req, res) => {
    try {
      const postId = req.params.id;
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).send("Post not found");
      }
  
      // If there's a new image
      if (req.files && req.files.length>0) {
        for (const img of post.images) {
          await cloudinary.uploader.destroy(img.cloudinaryId); // delete old image
        }
        const imageUploadResults = []

        for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path)
        imageUploadResults.push ( {
          url: result.secure_url, 
          cloudinaryId: result.public_id,
        })
      }
        post.images = imageUploadResults
      }
  
      // Update fields
      post.title = req.body.title;
      post.caption = req.body.caption;
      post.price = req.body.price;
      post.category = req.body.category;
      
      await post.save();
      console.log("Post updated!");
      res.redirect("/admin/profile");
    } catch (err) {
      console.error(err);
      res.status(500).send("Failed to update post");
    }
  },

  //Updates product's discount/onsale boolean status
  onSale: async (req, res) => {
    try {
      let onSaleFlag = req.body.discountUpdate>0
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        [{ $set: { 
            discount: { $toDecimal: Number.parseFloat(req.body.discountUpdate).toFixed(2)},
            onSale: onSaleFlag
            } 
        }]
      )
      console.log("item sale status changed!");
      res.redirect(`/admin/profile#${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },

  //updates available boolean status and quantity in profile
  updateQuantity: async (req, res) => {
    try {
      let availableFlag = req.body.updateQuantity>0
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        [{ $set: { 
            quantity: Number(req.body.updateQuantity),
            available: availableFlag
            } 
        }]
      )
      console.log(`Item's available status updated.`);
      res.redirect(`/admin/profile#${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  //updates favorite boolean status
  isFavorite: async (req, res) => {
    try {
      await Post.findOneAndUpdate({ _id: req.params.id }, [
        { $set: { favorite: { $not: "$favorite" } } }, //switches boolean
      ]);
      console.log("Item's favorite status has updated");
      res.redirect(`/admin/profile#${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      for (const image of post.images) {
        await cloudinary.uploader.destroy(image.cloudinaryId);
      }
      // Delete post from db
      await Post.deleteOne({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/admin/profile");
    } catch (err) {
      console.log('Failed to delete post:', err)
      res.redirect("/admin/profile");
    }
  },
};
