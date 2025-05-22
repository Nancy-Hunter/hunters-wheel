const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/postSchema");


module.exports = {
  // get request for admin profile page 
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find().sort( { category: "asc" } );
      res.render("profile.ejs", { 
        posts: posts, 
        user: req.user, 
        error: req.flash("error"), });
    } catch (err) {
      console.log(err);
    }
  },
  //creates document in MongoDB for product 
  createPost: async (req, res) => {
    try {
      // grab images 
      const mainImageFile = req.files["mainImage"]?.[0];
      const galleryFiles = req.files["galleryImages"] || [];

      const { title, caption, price } = req.body;

     // Check for missing required fields
      if (!title || !price || !caption || !mainImageFile) {
        req.flash("error", "Please fill out all required fields and upload a main image.");
        return res.redirect("/admin/profile");
      }

      // Upload main image
      const mainUpload = await cloudinary.uploader.upload(mainImageFile.path);

      // Upload gallery images
      const galleryUploads = await Promise.all(
        galleryFiles.map((file) => cloudinary.uploader.upload(file.path))
      );

      const galleryImages = galleryUploads.map((img) => ({
        url: img.secure_url,
        cloudinaryId: img.public_id,
      }));

      // const imageUploadResults = []

      // for (const file of req.files) {
      //   const result = await cloudinary.uploader.upload(file.path)
      //   imageUploadResults.push ( {
      //     url: result.secure_url, 
      //     cloudinaryId: result.public_id,
      //   })
      // }

      await Post.create({
        title: req.body.title,
        galleryImages: galleryImages,
        mainImageURL: mainUpload.secure_url,
        mainImageID: mainUpload.public_id,
        caption: req.body.caption,
        dimensions: req.body.dimensions,
        cartCount: 0,
        price: req.body.price,
        quantity: req.body.quantity,
        available: true,
        favorite: req.body.favorite,
        discount: req.body.discount > req.body.price? req.body.price : req.body.discount,
        onSale: req.body.discount>0,
        category: req.body.category,
        user: req.user.id,
      });
      console.log("Post has been added!")
      res.redirect("/admin/profile");
    } catch (err) {
      console.log(err)
    }
  },

  updatePost: async (req, res) => {
    try {
      const postId = req.params.id;
      const post = await Post.findById(postId);

      if (!post) {
        return res.status(404).send("Post not found");
      }
  
      // If there's a new gallery images
      if (req.files["galleryImages"] && req.files["galleryImages"].length>0) {
        for (const img of post.galleryImages) {
          await cloudinary.uploader.destroy(img.cloudinaryId); // delete old image
        }

        // const imageUploadResults = []
        // for (const file of req.files["galleryImages"]) {
        //   const result = await cloudinary.uploader.upload(file.path)
        //   imageUploadResults.push ( {
        //     url: result.secure_url, 
        //     cloudinaryId: result.public_id,
        //   })
        // }
        
        const galleryUploads = await Promise.all(
          req.files["galleryImages"].map((file) =>
            cloudinary.uploader.upload(file.path)
          )
        )
        post.galleryImages = galleryUploads.map((img) => ({
          url: img.secure_url,
          cloudinaryId: img.public_id,
        }))
      }

      // If there's a new main image
      if (req.files["mainImage"] && req.files["mainImage"][0]) {
        const mainImageFile = req.files["mainImage"][0]
        if (post.mainImageID) {
          await cloudinary.uploader.destroy(post.mainImageID); // delete old image
        }
        const result = await cloudinary.uploader.upload(mainImageFile.path)
        post.mainImageURL= result.secure_url
        post.mainImageID= result.public_id
      }
  
      // Update fields
      post.title = req.body.title;
      post.caption = req.body.caption;
      post.price = req.body.price;
      post.category = req.body.category;
      post.dimensions = req.body.dimensions
      
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
      const post = await Post.findById(req.params.id)
      const rawDiscount = parseFloat(req.body.discountUpdate).toFixed(2)
      const discount = rawDiscount <= post.price ? rawDiscount : post.price
      let onSaleFlag = discount > 0
      await Post.findByIdAndUpdate(req.params.id, {
        discount: discount,
        onSale: onSaleFlag,
      })
      console.log("item sale status changed!")
      if (rawDiscount>post.price) {
        req.flash("error", "Discount too high. Auto-adjusted to match price.")
      }
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
      for (const image of post.galleryImages) {
        await cloudinary.uploader.destroy(image.cloudinaryId);
      }
      await cloudinary.uploader.destroy(post.mainImageID);
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
