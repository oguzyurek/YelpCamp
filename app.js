require("dotenv").config();
console.log(process.env);

const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/review");
const morgan = require("morgan");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const { time } = require("console");
const AppError = require("./utils/AppError");
const ExpressError = require("./utils/ExpressError");
const { wrap } = require("module");
const session = require("express-session");
const sessionOption = {
  name:'session11'
  secret: "thisisasecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const user = require("./models/user");
const bodyParser = require("body-parser");
const mongoSanitize = require("express-mongo-sanitize");

/////DATABASE/////DATABASE/////DATABASE/////DATABASE/////DATABASE/////DATABASE

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

/////DATABASE/////DATABASE/////DATABASE/////DATABASE/////DATABASE/////DATABASE

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(morgan("dev"));
app.use(session(sessionOption));
app.use(flash());
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());
app.use(
  mongoSanitize({
    replaceWith: "_",
  })
);
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.use((req, res, next) => {
//     req.requestTime = Date.now();
//     console.log(`req time is: ${req.requestTime}`)
//     console.log(req.method, req.path);
//     return next();
// });

/////ROUTES/////ROUTES/////ROUTES/////ROUTES/////ROUTES/////ROUTES////

app.use((req, res, next) => {
  res.locals.currentUser = req.user; // you can reach to currentUser in all the pages.
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// app.use((req, res, next) => {
//     res.locals.messages = req.flash('success');
//     res.locals.messages = req.flash('error');
//     next();
// })

app.get("/fakeuser", async (req, res) => {
  const user = new User({ email: "oguz12@gmail.com", username: "oguz12" });
  const newUser12 = await User.register(user, "oguz123");
  res.send(newUser12);
});

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

/////ROUTES/////ROUTES/////ROUTES/////ROUTES/////ROUTES/////ROUTES////

/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR

app.listen(3000, () => {
  console.log("Serving on port 3000");
});
