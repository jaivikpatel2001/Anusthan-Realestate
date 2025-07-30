const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Validation rules for user registration/login
const validateAuth = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    handleValidationErrors
  ],
  
  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ]
};

// Validation rules for projects
const validateProject = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Project title must be between 2 and 100 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('location')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Location must be between 2 and 100 characters'),
    body('status')
      .isIn(['upcoming', 'ongoing', 'completed'])
      .withMessage('Status must be upcoming, ongoing, or completed'),
    body('category')
      .isIn(['residential', 'commercial', 'mixed'])
      .withMessage('Category must be residential, commercial, or mixed'),
    body('startingPrice')
      .optional()
      .isNumeric()
      .withMessage('Starting price must be a number'),
    handleValidationErrors
  ],
  
  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Project title must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Description must be between 10 and 2000 characters'),
    body('location')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Location must be between 2 and 100 characters'),
    body('status')
      .optional()
      .isIn(['upcoming', 'ongoing', 'completed'])
      .withMessage('Status must be upcoming, ongoing, or completed'),
    body('category')
      .optional()
      .isIn(['residential', 'commercial', 'mixed'])
      .withMessage('Category must be residential, commercial, or mixed'),
    body('startingPrice')
      .optional()
      .isNumeric()
      .withMessage('Starting price must be a number'),
    handleValidationErrors
  ]
};

// Validation rules for leads
const validateLead = {
  create: [
    body('mobile')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Please provide a valid 10-digit Indian mobile number'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('projectId')
      .isMongoId()
      .withMessage('Please provide a valid project ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    handleValidationErrors
  ]
};

// Validation rules for apartments
const validateApartment = {
  create: [
    body('projectId')
      .isMongoId()
      .withMessage('Please provide a valid project ID'),
    body('type')
      .trim()
      .isLength({ min: 1, max: 20 })
      .withMessage('Apartment type is required and must be less than 20 characters'),
    body('area')
      .isNumeric()
      .withMessage('Area must be a number'),
    body('price')
      .isNumeric()
      .withMessage('Price must be a number'),
    body('bedrooms')
      .isInt({ min: 0, max: 10 })
      .withMessage('Bedrooms must be a number between 0 and 10'),
    body('bathrooms')
      .isInt({ min: 0, max: 10 })
      .withMessage('Bathrooms must be a number between 0 and 10'),
    handleValidationErrors
  ]
};

module.exports = {
  validateAuth,
  validateProject,
  validateLead,
  validateApartment,
  handleValidationErrors
};
