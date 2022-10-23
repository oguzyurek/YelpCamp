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


router.get('/', cacthAsync(campgrounds.index));

router.get('/new', isLoggedIn, campgrounds.renderNewPage);

router.post('/', isLoggedIn, validateCampground, cacthAsync(campgrounds.postNewCampground));

router.get('/:id', cacthAsync(campgrounds.renderCampground));

router.get('/:id/edit', isAuthor, isLoggedIn, cacthAsync(campgrounds.renderEditPage));

router.put('/:id', isLoggedIn, isAuthor, validateCampground, cacthAsync(campgrounds.postEditPage));

router.delete('/:id', isLoggedIn, isAuthor, cacthAsync(campgrounds.deleteCampground));

module.exports = router;

