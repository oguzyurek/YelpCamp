module.exports.isLoggedIn = (req, res, next) => {
    console.log(req.user)
    if (!req.isAuthenticated()) {
        req.flash('error', 'You have to Sign In to see the page.')
        return res.redirect('/signin')
    } next();
};