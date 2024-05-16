const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");

const { storeReturnTo } = require("../middleware");
const users = require("../controllers/users");
router
  .route("/register")
  .get(users.renderRegisterPage)
  .post(catchAsync(users.createUser));

router
  .route("/login")
  .get(users.renderLoginPage)
  .post(
    storeReturnTo,
    passport.authenticate("local", {
      failureFlash: true,
      failureRedirect: "/login",
    }),
    users.login
  );

router.get("/logout", users.logout);

module.exports = router;
