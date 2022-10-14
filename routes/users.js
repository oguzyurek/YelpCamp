const express = require('express');
const router = express.Router();
const passport = require('passport');
const cacthAsync = require('../utils/cacthAsync');
const User = require('../models/user');


router.get('/register', async (req, res) => {
    res.render('../views/users/register')
})
router.post('/register', cacthAsync(async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.flash('success', 'You successfully registered.')
        res.redirect('/campgrounds');
        console.log(registeredUser);
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register')
    }

}))
router.get('/signin', async (req, res) => {
    res.render('../views/users/signin')
})
router.post('/signin', passport.authenticate('local', { failureFlash: true, failureRedirect: '/signin' }), (req, res) => {
    req.flash('success', 'Welcome back!');
    res.redirect('/campgrounds');
})


module.exports = router;
