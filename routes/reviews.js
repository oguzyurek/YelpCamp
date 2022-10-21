const express = require('express');
const app = express();
const router = express.Router({ mergeParams: true });
const Review = require('../models/review');
const { reviewSchema } = require('../schemas.js');
const Campground = require('../models/campground');
const catchAsync = require('../utils/cacthAsync')
const { isLoggedIn, validateReview } = require('../utils/middleware');
const AppError = require('../utils/AppError');
const ExpressError = require('../utils/ExpressError');
const cacthAsync = require('../utils/cacthAsync');




router.post('/', isLoggedIn, validateReview, cacthAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully added a new comment.');
    res.redirect(`/campgrounds/${campground._id}`)

}));

router.delete('/:reviewId', isLoggedIn, cacthAsync(async (req, res, next) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Comment is deleted.');
    res.redirect(`/campgrounds/${id}`)
}))

module.exports = router;