const express = require('express');
const router = express.Router();
const passport = require('passport');
const cacthAsync = require('../utils/cacthAsync');
const users = require('../controllers/users')
const User = require('../models/user');


router.get('/register', users.renderRegisterPage)

router.post('/register', cacthAsync(users.postRegisterPage))

router.get('/signin', users.renderSignin)

//keepSessionInfo has to be true to redirect after signin where we were.
router.post('/signin', passport.authenticate('local', { failureFlash: true, failureRedirect: '/signin', keepSessionInfo: true, }), users.validateSignin)

router.get('/logout', users.logout);

module.exports = router;
