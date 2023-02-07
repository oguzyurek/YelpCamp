if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const Campground = require("./models/campground");
const Review = require("./models/review");
const morgan = require("morgan");
const helmet = require("helmet");
const { campgroundSchema, reviewSchema } = require("./schemas.js");
const { time } = require("console");
const AppError = require("./utils/AppError");
const ExpressError = require("./utils/ExpressError");
const { wrap } = require("module");
const session = require("express-session");

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
const MongoDBStore = require("connect-mongo");
/////DATABASE/////DATABASE/////DATABASE/////DATABASE/////DATABASE/////DATABASE
// "mongodb://localhost:27017/yelp-camp"
// const dbUrl = process.env.DB_URL;
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";
mongoose.connect(dbUrl, {
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

// app.use(
//   session({
//     secret: "keyboard cat",
//     saveUninitialized: false, // don't create session until something stored
//     resave: false, //don't save session if unmodified
//     store: MongoDBStore.create({
//       mongoUrl: dbUrl,
//       touchAfter: 24 * 60 * 60, // time period in seconds
//     }),
//   })
// );

const secret = process.env.SECRET || "thisisasecret";

const store = MongoDBStore.create({
  mongoUrl: "mongodb://localhost/test-app",
  crypto: {
    secret,
  },
});

store.on("error", function (e) {
  console.log("SESSION ERROR", e);
});

const sessionOption = {
  store,
  name: "session11",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
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

app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
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
        "https://res.cloudinary.com/dlznt9a8n/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  }),
  helmet.crossOriginEmbedderPolicy({ policy: "credentialless" })
);

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
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serving on port ${port}`);
});
