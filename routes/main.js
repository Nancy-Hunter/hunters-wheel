const express = require("express");
const router = express.Router();
const homeController = require("../controllers/home");
const postsController = require("../controllers/posts");

//Main Routes - simplified for now
router.get("/", homeController.getIndex)
router.get("/category/:theme", postsController.getCategory)
router.get("/cart", postsController.getCart)
router.get("/deals", postsController.getDeals)
router.get("/:id", postsController.getPost)
router.post("/verify", postsController.verifyProduct)

module.exports = router;