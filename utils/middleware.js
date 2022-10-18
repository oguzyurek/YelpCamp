module.exports.isLoggedIn = async (req, res, next) => {
    console.log(req.user)
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You have to Sign In to see the page.')
        return res.redirect('/signin')
    } next();
};

module.exports.verifyPassword = (req, res, next) => {
    const { password } = req.query
    if (password === 'newyork') {
        next()
    }
    throw new AppError('Password required!', 401)
};

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(`,`)
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', `You need permission.`);
        return res.redirect(`/campgrounds/${campground._id}`)
    }
    next();
}


module.exports.wrapAsync = async (fn) => {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
};