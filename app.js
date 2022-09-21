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
})

/////FLASH/////FLASH/////FLASH/////FLASH/////FLASH/////FLASH/////FLASH

app.use((req, res, next) => {
    res.locals.messages = req.flash('success');
    next();
})











/////FLASH/////FLASH/////FLASH/////FLASH/////FLASH/////FLASH/////FLASH


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

app.get('/', (req, res) => {
    res.render('home')
});

function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}

app.get('/campgrounds', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', validateCampground, wrapAsync(async (req, res, next) => {
    console.log(result);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id', wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        return next(new AppError('Camground Not Found', 404))
    }

    res.render('campgrounds/show', { campground })
}));

app.get('/campgrounds/:id/edit', wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}));

app.get('/secret', verifyPassword, (req, res) => {
    res.send('This is my secret.')
})

app.put('/campgrounds/:id', validateCampground, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const deleted = await Campground.findByIdAndDelete(id);
    console.log(`${deleted.title} ${deleted.location}  is deleted.`)
    res.redirect('/campgrounds');
}))

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
app.get('/error', (req, res) => {
    chicken.fly()
})

app.get('/dogs', (req, res) => {
    res.send('Whoof Whoof!')
})

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

app.listen(3000, () => {
    console.log('Serving on port 3000')
})
