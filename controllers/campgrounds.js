const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
};


module.exports.new = (req, res) => {
    res.render('campgrounds/new')
};

module.exports.renderNewForm = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'New campground successfully created.');
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.show = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Can not find the Campground.')
        return res.render('/campgrounds', { campground })
    }
    res.render('campgrounds/show', { campground })
};