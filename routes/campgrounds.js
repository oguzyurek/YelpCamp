const express = require('express');
const app = express();
const router = express.Router();
const { campgroundSchema, reviewSchema } = require('../schemas.js');
const Campground = require('../models/campground');
const Review = require('../models/review');
const AppError = require('../utils/AppError');
const ExpressError = require('../utils/ExpressError');


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

router.get('/', wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', validateCampground, wrapAsync(async (req, res, next) => {
    console.log(result);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/:id', wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        return next(new AppError('Camground Not Found', 404))
    }

    res.render('campgrounds/show', { campground })
}));

router.get('/:id/edit', wrapAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}));

router.get('/secret', verifyPassword, (req, res) => {
    res.send('This is my secret.')
})

router.put('/:id', validateCampground, wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}));

router.delete('/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const deleted = await Campground.findByIdAndDelete(id);
    console.log(`${deleted.title} ${deleted.location}  is deleted.`)
    res.redirect('/campgrounds');
}))

module.exports = router;
