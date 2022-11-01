const express = require('express');
const app = express();
const router = express.Router();
const { campgroundSchema, reviewSchema } = require('../schemas.js');
const Campground = require('../models/campground');
const { isLoggedIn, isAuthor, validateCampground } = require('../utils/middleware');
const campground = require('../models/campground');
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

router.get('/new', isLoggedIn, campgrounds.renderNewPage);

router.route('/')
    .get(catchAsync(campgrounds.index))
    // .post(isLoggedIn, validateCampground, catchAsync(campgrounds.postNewCampground));
    .post(upload.single('image'), (req, res) => {
        res.send(req.body)
    })

router.route('/:id')
    .get(catchAsync(campgrounds.renderCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.postEditPage))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

router.get('/:id/edit', isAuthor, isLoggedIn, catchAsync(campgrounds.renderEditPage));

module.exports = router;

