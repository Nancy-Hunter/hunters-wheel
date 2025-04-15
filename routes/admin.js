const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const authController = require("../controllers/auth");
const adminController = require("../controllers/admin");
const { ensureAuth, ensureGuest } = require("../middleware/auth");

//Admin Routes 
router.get("/profile", ensureAuth, adminController.getProfile);
router.post("/createPost", upload.fields([
    { name: "mainImage", maxCount: 1},
    { name: "galleryImages", maxCount: 3},
]), adminController.createPost);
router.put("/updatePost/:id", upload.fields([
    { name: "mainImage", maxCount: 1},
    { name: "galleryImages", maxCount: 3},
]), adminController.updatePost);
router.put("/onSale/:id", adminController.onSale);
router.put("/updateQuantity/:id", adminController.updateQuantity);
router.put("/isFavorite/:id", adminController.isFavorite);
router.delete("/deletePost/:id", adminController.deletePost);

//Auth login/logout/reset
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/resetPassword", authController.getResetPassword);
//router.post("resetPassword", authController.resetPassword);
router.get("/logout", authController.logout);

//dev only?/ auth controller
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

module.exports = router;