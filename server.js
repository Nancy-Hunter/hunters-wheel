//Use .env file in config folder
require("dotenv").config({ path: "./config/.env" });

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const methodOverride = require("method-override");
const flash = require("express-flash");
const logger = require("morgan");
const connectDB = require("./config/database");
const mainRoutes = require("./routes/main");
const adminRoutes = require("./routes/admin");
const stripeRoutes = require("./routes/stripeRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const multer = require('multer');


// Passport config
require("./config/passport")(passport);

//Connect To Database
connectDB();

//Using EJS for views
app.set("view engine", "ejs");

//Static Folder
app.use(express.static("./public"));

//webhook route must be before body parser middleware
app.use("/checkout", webhookRoutes)

//Body Parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Logging
app.use(logger("dev"));

//Use forms for put / delete
app.use(methodOverride("_method"));

// Setup Sessions - stored in MongoDB
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  }),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Use flash messages for errors, info, ect...
app.use(flash());

//Setup Routes For Which The Server Is Listening
app.use("/", mainRoutes);
app.use("/admin", adminRoutes);
app.use("/checkout", stripeRoutes)

//multer error
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === "File type is not supported") {
    req.flash("error", err.message);
    return res.redirect("/admin/profile"); // redirect to profile
  }
  //sets flash messages
  res.locals.messages = req.flash();
  next(err); // for other types of errors
});
//404, castErrors, and server errors
app.use((err, req, res, next) => {
  console.log('Caught error:')
  if (err.name === "CastError") {
    return res.status(404).render("404", { title: "Not Found", message: "Invalid ID" });
  }
  console.error(err);
  res.status(500).render("500", { title: "Server Error" });
});
app.use((req, res, next) => {
  res.status(404).render("404", { title: "Page Not Found" });
});
//Server Running
app.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});
