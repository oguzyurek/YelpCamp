const express = require('express');
const app = express();
const router = express.Router({ mergeParams: true });
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const { reviewSchema } = require('../schemas.js');
const Campground = require('../models/campground');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../utils/middleware');
const AppError = require('../utils/AppError');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');




router.post('/', isLoggedIn, validateReview, catchAsync(reviews.postReview));

router.delete('/:reviewId', isReviewAuthor, isLoggedIn, catchAsync(reviews.deleteReview))

module.exports = router;