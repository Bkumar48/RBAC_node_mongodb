const express = require("express");
const createHttpErrors = require("http-errors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const dbConnect = require("./config/dbConnect");
const connectFlash = require("connect-flash");
require("dotenv").config();
const passport = require("passport");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { ensureLoggedIn } = require("connect-ensure-login");
const constants = require("./utils/constants");
// initialixation
const app = express();
app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//

// Init session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
    }),
  })
);

// Passport Authentication
app.use(passport.initialize());
app.use(passport.authenticate("session"));
require("./utils/passportAuth");

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Routes
app.use("/", require("./routes/indexRoute"));
app.use("/auth", require("./routes/authRoute"));
app.use(
  "/user",
  ensureLoggedIn({ redirectTo: "/auth/login" }),
  require("./routes/userRoute")
);
app.use(
  "/admin",
  ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  require("./routes/adminRoute")
);

app.use((req, res, next) => {
  next(createHttpErrors.NotFound());
});

app.use((error, req, res, next) => {
  error.status = error.status || 500;
  res.status(error.status);
  res.render("error404", { error });
});

const PORT = process.env.PORT || 8080;

try {
  dbConnect();
  app.listen(PORT, () => {
    console.log(`🚀 on port ${PORT}`);
  });
} catch (error) {
  throw new Error(error);
}

function ensureAdmin(req, res, next) {
  if (req.user.role === constants.roles.admin) {
    return next();
  } else {
    req.flash("error", "You are not authorized to view this page");
    res.redirect("/");
  }
}
function ensureModerator(req, res, next) {
  if (req.user.role === constants.roles.moderator) {
    return next();
  } else {
    req.flash("error", "You are not authorized to view this page");
    res.redirect("/");
  }
}
