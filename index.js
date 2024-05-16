if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const morgan = require("morgan");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const ExpressError = require("./utils/ExpressError");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const { campgroundSchema, reviewSchema } = require("./schemas");

const campgroundsRoute = require("./routes/campgrounds");
const reviewsRoute = require("./routes/reviews");
const usersRoute = require("./routes/users");

const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/campGroundApp";
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(dbUrl);
  console.log("MONGO CONNECTION OPEN");
}
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(morgan("tiny"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({ replaceWith: "_" }));
app.use(helmet());

const scriptSrcUrls = [
  "https://api.maptiler.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://unpkg.com/leaflet@1.9.3/",
  "https://unpkg.com/leaflet.markercluster@1.4.1/",
  "https://cdn.maptiler.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net/",
];
const styleSrcUrls = [
  "https://api.maptiler.com/",
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",

  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/",
  "https://cdn.maptiler.com/",
  "https://unpkg.com/leaflet@1.9.3/",
  "https://unpkg.com/leaflet.markercluster@1.4.1/",
];
const connectSrcUrls = [
  "https://api.maptiler.com/",
  // "https://api.unsplash.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dttb8qxov/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
        "https://api.unsplash.com/",
        "https://api.maptiler.com/maps/",
        "https://api.maptiler.com/resources/",
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

// process.env.secret stored in heroku/RENDER as an env variable
const secret = process.env.SECRET || "thisisatempsecret";

const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
    secret,
  },
});

store.on("error", function (err) {
  console.log("SESSION STORE ERROR", err);
});

const sessionConfig = {
  store,
  name: "campSession",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure:true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/fakeUser", async (req, res) => {
  const user = new User({
    email: "test@gmail.com",
    username: "tester",
  });
  const newUser = await User.register(user, "chicken");
  res.send(newUser);
});

app.use("/campgrounds", campgroundsRoute);
app.use("/campgrounds/:id/reviews", reviewsRoute);
app.use("/", usersRoute);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  console.log(err.message);
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log("APP LISTENING ON PORT 3000!");
});
