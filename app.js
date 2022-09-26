const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');
const morgan = require('morgan');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const { time } = require('console');
const AppError = require('./utils/AppError');
const ExpressError = require('./utils/ExpressError');
const { wrap } = require('module');
const session = require('express-session');
const sessionOption = { secret: 'thisisasecret', resave: false, saveUninitialized: false }
const flash = require('connect-flash');
const campgrounds = require('./routes/campgrounds')


/////DATABASE/////DATABASE/////DATABASE/////DATABASE/////DATABASE/////DATABASE

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

/////DATABASE/////DATABASE/////DATABASE/////DATABASE/////DATABASE/////DATABASE

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(morgan('dev'))
app.use(session(sessionOption));
app.use(flash())



app.use((req, res, next) => {
    req.requestTime = Date.now();
    console.log(`req time is: ${req.requestTime}`)
    console.log(req.method, req.path);
    return next();
});

/////ROUTES/////ROUTES/////ROUTES/////ROUTES/////ROUTES/////ROUTES////

app.use('/campgrounds', campgrounds)






/////ROUTES/////ROUTES/////ROUTES/////ROUTES/////ROUTES/////ROUTES////



/////FLASH/////FLASH/////FLASH/////FLASH/////FLASH/////FLASH/////FLASH

app.use((req, res, next) => {
    res.locals.messages = req.flash('success');
    next();
})


/////FLASH/////FLASH/////FLASH/////FLASH/////FLASH/////FLASH/////FLASH





/////FUNCTIONS/////FUNCTIONS/////FUNCTIONS/////FUNCTIONS/////FUNCTIONS

const verifyPassword = (req, res, next) => {
    const { password } = req.query
    if (password === 'newyork') {
        next()
    }
    throw new AppError('Password required!', 401)
};

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(`,`)
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}

/////FUNCTIONS/////FUNCTIONS/////FUNCTIONS/////FUNCTIONS/////FUNCTIONS

//////REVIEWS////////////REVIEWS////////////REVIEWS////////////


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(`,`)
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


app.post('/campgrounds/:id/reviews', validateReview, wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully added a new comment.')
    res.redirect(`/campgrounds/${campground._id}`)

}));

app.delete('/campgrounds/:id/reviews/:reviewId', wrapAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
}))

//////REVIEWS////////////REVIEWS////////////REVIEWS////////////


app.get('/dogs', (req, res) => {
    res.send('Whoof Whoof!')
})

/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR

app.get('/admin', (req, res) => {
    throw new AppError('You are not an Admin!', 403)
})

const handleValidationErr = err => {
    console.dir(err);
    return new AppError(`Validation Failed...${err.message}`, 400)
}

app.use((err, req, res, next) => {
    console.log(err.name);
    if (err.name === ' ValidationError') err = handleValidationErr(err);
    next(err);
})

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh no, Something went wrong!'
    res.status(statusCode).render('error', { err })
})

/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR/////ERROR




app.listen(3000, () => {
    console.log('Serving on port 3000')
})

