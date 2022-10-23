const express = require('express');
const app = express();
const router = express.Router();
const { campgroundSchema, reviewSchema } = require('../schemas.js');
const Campground = require('../models/campground');
const Review = require('../models/review');
const AppError = require('../utils/AppError');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, isAuthor, validateCampground } = require('../utils/middleware');
const campgrounds = require('../controllers/campgrounds')
const campground = require('../models/campground');
const cacthAsync = require('../utils/cacthAsync.js');


router.get('/', cacthAsync(campgrounds.index));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);



router.post('/', isLoggedIn, validateCampground, cacthAsync(campground.post));

router.get('/:id', cacthAsync(campground.show));

router.get('/:id/edit', isAuthor, isLoggedIn, cacthAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', `Can not find the Campground.`);
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', { campground });
}));



router.put('/:id', isLoggedIn, isAuthor, validateCampground, cacthAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', `${campground.title} ${campground.location}  is edited.`);
    res.redirect(`/campgrounds/${campground._id}`)

    // const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });

}));

router.delete('/:id', isLoggedIn, isAuthor, cacthAsync(async (req, res, next) => {
    const { id } = req.params;
    const deleted = await Campground.findByIdAndDelete(id);
    console.log(`${deleted.title} ${deleted.location}  is deleted.`)
    req.flash('success', `${deleted.title} ${deleted.location}  is deleted.`);
    res.redirect('/campgrounds');
}));

module.exports = router;

