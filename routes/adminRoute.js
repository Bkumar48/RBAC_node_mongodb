const mongoose = require("mongoose");
const router = require("express").Router();
const User = require("../models/userModel");
const constants = require("../utils/constants");
router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find({});
    // res.send(users);
    res.render("manage-users", { users });
  } catch (error) {
    next(error);
  }
});

router.get("/users/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      req.flash("error", "Invalid User Id");
      return res.redirect("/admin/users");
    }
    const person = await User.findById(req.params.id);
    res.render("profile", { person });
  } catch (error) {
    next(error);
  }
});

router.post("/update-role", async (req, res, next) => {
  const { id, role } = req.body;

  if (!id || !role) {
    req.flash("error", "All fields are required");
    return res.redirect("/admin/users");
  }

  // check for valid mongoose Objectid
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid User Id");
    return res.redirect("/admin/users");
  }

  // check for valid role
  const rolesArray = Object.values(constants.roles);
  if (!rolesArray.includes(role)) {
    req.flash("error", "Invalid Role");
    return res.redirect("/admin/users");
  }

  // Admin can't change his own role
  if (req.user._id.toString() === id) {
    req.flash("error", "You can not change your own role");
    return res.redirect("/admin/users");
  }

  // update role
  const user = await User.findByIdAndUpdate(
    id,
    {role },
    { new: true, runValidators: true }
  );
  
  req.flash("success", `Role of ${user.email} is updated to ${role}`);
  res.redirect("/admin/users");
});

module.exports = router;
