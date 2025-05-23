const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    // console.log(err);
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
