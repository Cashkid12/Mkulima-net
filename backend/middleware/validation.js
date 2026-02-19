const { body, validationResult } = require('express-validator');

const validateRegister = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  
  body('username')
    .trim()
    .isLength({ min: 4, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 4-30 characters, no spaces, only letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('phoneNumber')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const validateLogin = [
  body('emailOrUsername')
    .notEmpty()
    .withMessage('Email or username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validatePost = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Post content must be between 1 and 1000 characters'),
  
  body('postType')
    .isIn(['update', 'harvest', 'question', 'market', 'job'])
    .withMessage('Invalid post type')
];

const validateProduct = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Product title must be between 3 and 100 characters'),
  
  body('category')
    .isIn(['crops', 'products', 'livestock', 'tools', 'services'])
    .withMessage('Invalid product category'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1')
];

const validateJob = [
  body('companyName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Job title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Job description must be between 10 and 2000 characters'),
  
  body('requirements')
    .isArray({ min: 1 })
    .withMessage('At least one requirement is required'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  
  body('jobType')
    .isIn(['full-time', 'part-time', 'internship', 'contract', 'temporary'])
    .withMessage('Invalid job type')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validatePost,
  validateProduct,
  validateJob,
  validate
};