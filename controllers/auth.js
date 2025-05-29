const passport = require("passport");
const validator = require("validator");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");

exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect("/admin/profile");
  }
  res.render("login", {
    title: "Login",
  });
};


exports.postLogin = async (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (validator.isEmpty(req.body.password))
    validationErrors.push({ msg: "Password cannot be blank." });
  
  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("/admin/login");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });
  
  passport.authenticate("local", async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash("errors", info);
      return res.redirect("/admin/login");
    }
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", { msg: "Success! You are logged in." });
      res.redirect(req.session.returnTo || "/admin/profile");
    });
  })(req, res, next);
};

exports.logout = async (req, res) => {
  req.logout(() => {
    console.log('User has logged out.')
  })
  req.session.destroy((err) => {
    if (err)
      console.log("Error : Failed to destroy the session during logout.", err);
    req.user = null;
    res.redirect("/");
  });
};

exports.getSignup = async (req, res) => {
  if (req.user) {
    return res.redirect("/admin/profile");
  }
  res.render("signup", {
    title: "Create Account",
  });
};

exports.postSignup = async (req, res, next) => {
  const validationErrors = [];
  if (!validator.isEmail(req.body.email))
    validationErrors.push({ msg: "Please enter a valid email address." });
  if (!validator.isLength(req.body.password, { min: 8 }))
    validationErrors.push({
  msg: "Password must be at least 8 characters long",
});
if (req.body.password !== req.body.confirmPassword)
    validationErrors.push({ msg: "Passwords do not match" });

  if (validationErrors.length) {
    req.flash("errors", validationErrors);
    return res.redirect("../admin/signup");
  }
  req.body.email = validator.normalizeEmail(req.body.email, {
    gmail_remove_dots: false,
  });
  
  const user = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
  });
  try {
    const existingUser = await User.findOne({ $or: [{ email: req.body.email }, { userName: req.body.userName }] });
    if (existingUser) {
      req.flash("errors", {
        msg: "Account with that email address or username already exists.",
      });
      return res.redirect("/admin/signup");
    }
    await user.save();
    await new Promise((resolve, reject)=> {
      req.logIn(user, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    res.redirect("/admin/profile");
  } catch (err) {
    next(err)
  } 
};

// controllers for password reset

exports.getForgotPassword = async (req, res) => {
  if (req.user) {
    return res.redirect("/admin/profile");
  }
  res.render("resetPassword", {
    title: "Reset Password",
  });
};

exports.resetPassword = async (req, res) => {
  const {email} = req.body
  const user = await User.findOne({email})
  //boots users without valid email
  if (!user) {
    req.flash('error', 'No account with that email found.')
    return res.redirect('/admin/forgotPassword')
  }
  //crypto magic
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  //save in mongoDB tokenHash and expiry
  user.resetPasswordToken = tokenHash;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 120; // 120 mins
  await user.save();
  
  //change to url on liveload
  const resetURL = `http://${req.headers.host}/admin/updatePassword/${token}`;
  
  const transporter = nodemailer.createTransport({
    //change on liveload email service!
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  await transporter.sendMail({
    to: user.email,
    // update from on liveload
    from: `"The Hunter's Wheel" <${process.env.EMAIL_USER}>`,
    subject: "Password Reset",
    html: `<p>Click the link to reset your password:</p><a href="${resetURL}">${resetURL}</a>`,
  });

  req.flash("info", "A password reset email has been sent.");
  res.redirect("/admin/login");
}

exports.getUpdatePassword = async (req, res) => {
  const token = req.body.token || req.params.token;
  //have to hash the token again because it was saved hashed
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() }, 
  });
  
  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('/admin/forgotPassword');
  }

 res.render('updatePassword', {
    title: 'Set New Password',
    token: token 
  })
}

exports.updatePassword = async (req, res) => {
  const token = req.body.token || req.params.token;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const { password, confirmPassword } = req.body;

  const validationErrors = [];
  
  if (!validator.isLength(password, { min: 8 })) {
    validationErrors.push({ msg: "Password must be at least 8 characters long", });
  }
  if (password !== confirmPassword) {
    validationErrors.push({ msg: "Passwords do not match" });
  }
  if (validationErrors.length) {
      req.flash("errors", validationErrors);
      return res.redirect(`/admin/updatePassword/${token}`);
  }

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  })

  if (!user) {
    validationErrors.push({ msg: "Token is invalid or expired.", })
    req.flash('errors', validationErrors);
    return res.redirect('/admin/forgotPassword');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  req.flash('info', ['Password updated successfully. Please log in.']);
  res.redirect('/admin/login');
};

 