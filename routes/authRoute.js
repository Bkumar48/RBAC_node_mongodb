const router = require("express").Router();
const Uzer = require("../models/userModel");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const { ensureLoggedOut, ensureLoggedIn } = require("connect-ensure-login");
const {registerValidator} = require("../utils/validators");
router.get(
  "/login",
  ensureLoggedOut({ redirectTo: "/" }),
  async (req, res, next) => {
    res.render("login");
  }
);
router.post(
  "/login",
  ensureLoggedOut({ redirectTo: "/" }),
  passport.authenticate("local", {
    // successRedirect: "/user/profile",
    successReturnToOrRedirect: "/",
    failureRedirect: "/auth/login?attempt=true",
    failureFlash: true,
    keepSessionInfo: true
  })
);

router.get(
  "/register",
  ensureLoggedOut({ redirectTo: "/" }),
  async (req, res, next) => {
    res.render("register");
  }
);

router.post(
  "/register",
  ensureLoggedOut({ redirectTo: "/" }),
  registerValidator,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
          req.flash("error", error.msg);
        });
        res.render("register", {
          email: req.body.email,
          messages: req.flash(),
        });
        return;
      }
      const { email } = req.body;
      const doesExist = await Uzer.findOne({ email });
      if (doesExist) {
        req.flash("warning", "You already have an account");
        res.redirect("/auth/login");
        return;
      }
      const uzer = new Uzer(req.body);
      await uzer.save();
      req.flash(
        "success",
        "You have been registered successfully , ready to login"
      );
      res.redirect("/auth/login");
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/logout",
  ensureLoggedIn({ redirectTo: "/" }),
  async (req, res, next) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  }
);

module.exports = router;

// function ensureAuthenticated  (req,res,next){
//   if(req.isAuthenticated()){
//     next();
//   }else{
//     res.redirect("/auth/login");
//   }
// }

// function ensureNOTAuthenticated  (req,res,next){
//   if(req.isAuthenticated()){
//     res.redirect("back");
//   }else{
//     next();
//   }
// }
