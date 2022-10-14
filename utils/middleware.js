module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You have to Sign In to see the page.')
        res.redirect('/signin')
    } next();
};