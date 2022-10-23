const Review = require('../models/review');
const Campground = require('../models/campground');
const User = require('../models/user');


module.exports.renderRegisterPage = async (req, res) => {
    res.render('../views/users/register')
};

module.exports.postRegisterPage = async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'You successfully registered.')
            res.redirect('/campgrounds');
            console.log(registeredUser);
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register')
    }
};

