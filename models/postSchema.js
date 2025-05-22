const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  mainImageURL: {
    type: String,
  },
  mainImageID: {
    type: String,
  },
  galleryImages: [
    {
      url : String,
      cloudinaryId: String,
    },
  ],
  caption: {
    type: String,
    required: true,
  },
  dimensions: {
    type: String,
  },
  price: {
    type: Number,
    require: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
  favorite: {
    type: Boolean,
    default: true,
    required: true,
  },
  onSale: {
    type: Boolean,
    default: false,
    required: true,
  },
  cartCount: {
    type: Number,
    default: 0,
  },
  quantity: {
    type: Number,
    default: 1,
    required: true, 
  },
  discount: {
    type:  Number,
    default: 0,
  },
  category: {
    type: String,
  },
  user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", PostSchema);