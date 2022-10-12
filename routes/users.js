const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/register', async (req, res) => {
    res.render('../views/users/register')
})
router.post('/register', async (req, res) => {
    res.send(req.body);
    console.log
})
router.get('/signin', async (req, res) => {
    res.render('../views/users/signin')
})
router.post('/signin', async (req, res) => {
    res.send(req.body);
    console.log
})


module.exports = router;
