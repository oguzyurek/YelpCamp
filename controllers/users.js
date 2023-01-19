const Review = require("../models/review");
const Campground = require("../models/campground");
const User = require("../models/user");

module.exports.renderHomePage = async (req, res) => {
  res.render("../views/home");
};

module.exports.renderRegisterPage = async (req, res) => {
  res.render("../views/users/register");
};

module.exports.postRegisterPage = async (req, res, next) => {
  try {
    const { username, password, email } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "You successfully registered.");
      res.redirect("/campgrounds");
      console.log(registeredUser);
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};

module.exports.renderSignin = async (req, res) => {
  res.render("../views/users/signin");
};

module.exports.validateSignin = (req, res) => {
  req.flash("success", "Welcome back!");
  const redirectUrl = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

// DOES NOT WORK IN NEW VERSION.
// router.get('/logout', (req, res, next) => {
//     req.logOut();
//     req.flash('success', 'You successfully logged out. Good bye!')
//     res.redirect('/campgrounds')
// });

module.exports.logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};
