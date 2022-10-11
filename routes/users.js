const express = require('express');
const router = express.Router();
const User = require('../models/user');

router.get('/register', async (req, res) => {
    res.render('../views/users/register')
})
router.post('/register', async (req, res) => {
    res.send(req.body)
})


module.exports = router;
