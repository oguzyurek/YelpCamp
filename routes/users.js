const express = require('express');
const router = express.Router();
const passport = require('passport');
const cacthAsync = require('../utils/cacthAsync');
const users = require('../controllers/users')
const User = require('../models/user');


router.get('/register', users.renderRegisterPage)
router.post('/register', cacthAsync(users.postRegisterPage))
router.get('/signin', async (req, res) => {
    res.render('../views/users/signin')
})

//keepSessionInfo has to be true to redirect after signin where we were.
router.post('/signin', passport.authenticate('local', { failureFlash: true, failureRedirect: '/signin', keepSessionInfo: true, }), (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})


// DOES NOT WORK IN NEW VERSION.
// router.get('/logout', (req, res, next) => {
//     req.logOut();
//     req.flash('success', 'You successfully logged out. Good bye!')
//     res.redirect('/campgrounds')
// });

router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); };
        req.flash('success', "Goodbye!");
        res.redirect('/campgrounds');
    });
});

router.get('/asd', (req, res) => {
    req.flash('success', 'heyyyy');
    res.render('/campgrounds')
})


module.exports = router;
