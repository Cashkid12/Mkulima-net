const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const upload = require('../utils/upload');

// @route   PUT /api/profile
// @desc    Update user profile
// @access  Private
router.put('/', auth, [
  // Validation rules
  body('bio').optional().isLength({ max: 500 }),
  body('location').optional().trim(),
  body('farmName').optional().trim(),
  body('skills').optional().isArray(),
  body('skills.*.name').optional().trim().isLength({ min: 1, max: 50 }),
  body('skills.*.level').optional().isIn(['Beginner', 'Intermediate', 'Professional', 'Expert']),
  body('certifications').optional().isArray(),
  body('certifications.*.name').optional().trim().isLength({ min: 1, max: 100 }),
  body('certifications.*.issuer').optional().trim().isLength({ min: 1, max: 100 }),
  body('certifications.*.date').optional().trim().matches(/^\d{4}$/),
  body('services').optional().isArray(),
  body('services.*.name').optional().trim().isLength({ min: 1, max: 100 }),
  body('services.*.description').optional().trim().isLength({ min: 1, max: 500 }),
  body('services.*.price').optional().trim().isLength({ min: 1, max: 50 }),
  body('crops').optional().isArray(),
  body('livestock').optional().isArray(),
  body('farmSize').optional().trim(),
  body('yearsExperience').optional().isInt({ min: 0, max: 100 }),
  body('experienceLevel').optional().isIn(['Beginner', 'Intermediate', 'Professional', 'Expert']),
  body('availabilityStatus').optional().isIn(['Open to Work', 'Open to Internships', 'Hiring', 'Not Available']),
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array().map(err => ({ msg: err.msg, param: err.param })) 
      });
    }

    const {
      bio,
      location,
      farmName,
      skills,
      certifications,
      services,
      crops,
      livestock,
      farmSize,
      yearsExperience,
      experienceLevel,
      availabilityStatus
    } = req.body;

    // Build profile object
    const profileFields = {};
    
    if (bio) profileFields.bio = bio;
    if (location) profileFields.location = location;
    if (farmName) profileFields.farmName = farmName;
    if (skills) profileFields.skills = skills;
    if (certifications) profileFields.certifications = certifications;
    if (services) profileFields.services = services;
    if (crops) profileFields.crops = crops;
    if (livestock) profileFields.livestock = livestock;
    if (farmSize) profileFields.farmSize = farmSize;
    if (yearsExperience) profileFields.yearsExperience = yearsExperience;
    if (experienceLevel) profileFields.experienceLevel = experienceLevel;
    if (availabilityStatus) profileFields.availabilityStatus = availabilityStatus;

    // Update profile
    const user = await User.findByIdAndUpdate(
      { _id: req.user.id },
      { $set: profileFields },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json({ 
      msg: 'Profile updated successfully', 
      profile: user 
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/profile/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/profile/:userId
// @desc    Get user profile by ID
// @access  Public (or Private based on privacy settings)
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/profile/certificate
// @desc    Upload certificate file
// @access  Private
router.post('/certificate', auth, upload.single('certificate'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // Return the file path for storing in the user's profile
    res.json({
      msg: 'Certificate uploaded successfully',
      filePath: req.file.path
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;