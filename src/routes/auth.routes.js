const express = require('express');
const { body } = require('express-validator');
const { register, login } = require('../controllers/auth.controller');

const router = express.Router();

// Register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role').notEmpty().withMessage('Role is required'),
  ],
  register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

module.exports = router;