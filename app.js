const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const morgan = require('morgan');
const { time } = require('console');
const AppError = require('./AppError');
const { wrap } = require('module');

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

app.use((req, res, next) => {
    req.requestTime = Date.now();
    console.log(`req time is: ${req.requestTime}`)
    console.log(req.method, req.path);
    return next();
})

const verifyPassword = (req, res, next) => {
    const { password } = req.query
    if (password === 'newyork') {
        next()
    }
    throw new AppError('Password required!', 401)
};

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

app.post('/campgrounds', wrapAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.get('/campgrounds/:id', wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
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

app.put('/campgrounds/:id', wrapAsync(async (req, res, next) => {
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

app.get('/error', (req, res) => {
    chicken.fly()
})

app.get('/admin', (req, res) => {
    throw new AppError('You are not an Admin!', 403)
})

// app.use((req, res) => {
//     res.status(404).send('404 NOT FOUND')
// })

// app.use((err, req, res, next) => {
//     console.log('**********************')
//     console.log('*********ERROR********')
//     console.log('**********************')
//     console.log(err)
//     next(err)

// })

const handleValidationErr = err => {
    console.dir(err);
    return new AppError(`Validation Failed...${err.message}`, 400)
}

app.use((err, req, res, next) => {
    console.log(err.name);
    if (err.name === ' ValidationError') err = handleValidationErr(err);
    next(err);
})


app.use((err, req, res, next) => {
    const { status = 500, message = 'error' } = err;
    res.status(status).send(message)
})





app.listen(3000, () => {
    console.log('Serving on port 3000')
})
