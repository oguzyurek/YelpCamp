const express = require('express');
const app = express();
const router = express.Router();
const { campgroundSchema, reviewSchema } = require('../schemas.js');
const Campground = require('../models/campground');
const Review = require('../models/review');
const AppError = require('../utils/AppError');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn, isAuthor, validateCampground } = require('../utils/middleware');
const campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds');
const cacthAsync = require('../utils/cacthAsync.js');

router.route('/')
    .get(cacthAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, cacthAsync(campgrounds.postNewCampground));

router.route('/:id')
    .get(cacthAsync(campgrounds.renderCampground))
    .put(isLoggedIn, isAuthor, validateCampground, cacthAsync(campgrounds.postEditPage))
    .delete(isLoggedIn, isAuthor, cacthAsync(campgrounds.deleteCampground))

router.get('/new', isLoggedIn, campgrounds.renderNewPage);

router.get('/:id/edit', isAuthor, isLoggedIn, cacthAsync(campgrounds.renderEditPage));

module.exports = router;

