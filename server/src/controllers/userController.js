// src/controllers/userController.js
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc Search users by name or email
// @route GET /api/users/search?q=
exports.searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q || '';
    const regex = new RegExp(query, 'i');
    const users = await User.find({ $or: [{ name: regex }, { email: regex }] })
      .select('name email avatar')
      .limit(20);
    res.json(users);
  } catch (err) {
    next(err);
  }
};
