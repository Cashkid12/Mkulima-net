const express = require('express');
const Job = require('../models/Job');
const authenticateToken = require('../middleware/auth');
const { validateJob, validate } = require('../middleware/validation');
const router = express.Router();

// @route   POST api/jobs
// @desc    Create a new job
// @access  Private
router.post('/', authenticateToken, validateJob, validate, async (req, res) => {
  try {
    const {
      companyName,
      title,
      description,
      requirements,
      location,
      jobType,
      salary,
      applicationDeadline,
      experienceLevel
    } = req.body;

    const newJob = new Job({
      companyName,
      title,
      description,
      requirements,
      location,
      jobType,
      salary,
      applicationDeadline,
      experienceLevel,
      postedBy: req.user._id
    });

    await newJob.save();

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job: newJob
    });
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while creating job'
    });
  }
});

// @route   GET api/jobs
// @desc    Get all jobs with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      location,
      jobType,
      experienceLevel,
      search,
      page = 1,
      limit = 10
    } = req.query;

    let query = { isActive: true };

    // Apply filters
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const jobs = await Job.find(query)
      .populate('postedBy', 'username fullName profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      jobs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs'
    });
  }
});

// @route   GET api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'username fullName profileImage email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      job
    });
  } catch (err) {
    console.error('Get job error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job'
    });
  }
});

// @route   PUT api/jobs/:id
// @desc    Update job
// @access  Private
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job poster
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (err) {
    console.error('Update job error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating job'
    });
  }
});

// @route   DELETE api/jobs/:id
// @desc    Delete job
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job poster
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (err) {
    console.error('Delete job error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting job'
    });
  }
});

// @route   GET api/jobs/user/my-jobs
// @desc    Get jobs posted by current user
// @access  Private
router.get('/user/my-jobs', authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      jobs
    });
  } catch (err) {
    console.error('Get user jobs error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user jobs'
    });
  }
});

// @route   GET api/jobs/suggestions/:userId
// @desc    Get job suggestions based on user profile
// @access  Private
router.get('/suggestions/:userId', authenticateToken, async (req, res) => {
  try {
    // Ensure the user is authorized to access their own suggestions
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view these job suggestions'
      });
    }

    // Fetch user profile
    const User = require('../models/User');
    const user = await User.findById(req.params.userId).select('skills certifications services crops livestock yearsExperience location');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate match scores for all active jobs
    const allJobs = await Job.find({ isActive: true })
      .populate('postedBy', 'username fullName profileImage')
      .sort({ createdAt: -1 });

    // Calculate match scores based on user profile
    const scoredJobs = allJobs.map(job => {
      let matchScore = 0;
      const matchedSkills = [];

      // Match skills
      if (user.skills && Array.isArray(user.skills)) {
        user.skills.forEach(userSkill => {
          job.requirements.forEach(jobRequirement => {
            // Case-insensitive partial matching for skills
            if (jobRequirement.toLowerCase().includes(userSkill.name.toLowerCase()) ||
                userSkill.name.toLowerCase().includes(jobRequirement.toLowerCase())) {
              matchScore += 20; // Higher weight for skill match
              matchedSkills.push(userSkill.name);
            }
          });
        });
      }

      // Match certifications
      if (user.certifications && Array.isArray(user.certifications)) {
        user.certifications.forEach(cert => {
          job.requirements.forEach(jobRequirement => {
            if (jobRequirement.toLowerCase().includes(cert.name.toLowerCase()) ||
                cert.name.toLowerCase().includes(jobRequirement.toLowerCase())) {
              matchScore += 15; // Medium weight for certification match
            }
          });
        });
      }

      // Match services offered
      if (user.services && Array.isArray(user.services)) {
        user.services.forEach(service => {
          job.requirements.forEach(jobRequirement => {
            if (jobRequirement.toLowerCase().includes(service.name.toLowerCase()) ||
                service.name.toLowerCase().includes(jobRequirement.toLowerCase())) {
              matchScore += 15; // Medium weight for service match
            }
          });
        });
      }

      // Match crops and livestock
      if (user.crops && Array.isArray(user.crops)) {
        user.crops.forEach(crop => {
          job.requirements.forEach(jobRequirement => {
            if (jobRequirement.toLowerCase().includes(crop.toLowerCase()) ||
                crop.toLowerCase().includes(jobRequirement.toLowerCase())) {
              matchScore += 10; // Lower weight for crop match
            }
          });
        });
      }

      if (user.livestock && Array.isArray(user.livestock)) {
        user.livestock.forEach(animal => {
          job.requirements.forEach(jobRequirement => {
            if (jobRequirement.toLowerCase().includes(animal.toLowerCase()) ||
                animal.toLowerCase().includes(jobRequirement.toLowerCase())) {
              matchScore += 10; // Lower weight for livestock match
            }
          });
        });
      }

      // Experience matching - bonus for matching experience level
      if (user.yearsExperience > 0) {
        if (job.experienceLevel === 'entry' && user.yearsExperience < 2) {
          matchScore += 5;
        } else if (job.experienceLevel === 'mid' && user.yearsExperience >= 2 && user.yearsExperience <= 5) {
          matchScore += 10;
        } else if (job.experienceLevel === 'senior' && user.yearsExperience > 5) {
          matchScore += 15;
        } else if (job.experienceLevel === 'executive' && user.yearsExperience > 8) {
          matchScore += 20;
        }
      }

      // Location matching - bonus if job location matches user location
      if (user.location && job.location.toLowerCase().includes(user.location.toLowerCase())) {
        matchScore += 10;
      }

      // Cap the match score at 100
      const finalScore = Math.min(matchScore, 100);

      return {
        ...job.toObject(),
        matchScore: finalScore,
        matchedSkills: [...new Set(matchedSkills)] // Remove duplicates
      };
    });

    // Sort jobs by match score (highest first)
    const sortedJobs = scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    // Return top 20 suggestions
    const suggestions = sortedJobs.slice(0, 20);

    res.json({
      success: true,
      jobs: suggestions,
      totalSuggestions: suggestions.length
    });
  } catch (err) {
    console.error('Get job suggestions error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching job suggestions'
    });
  }
});

// @route   POST api/jobs/:id/apply
// @desc    Apply for a job
// @access  Private
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const { coverLetter } = req.body;
    const jobId = req.params.id;

    // Find the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user has already applied for this job
    const existingApplication = job.applications.find(app => 
      app.userId.toString() === req.user._id.toString()
    );

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Add application to job
    job.applications.push({
      userId: req.user._id,
      coverLetter: coverLetter || '',
      appliedAt: new Date()
    });

    await job.save();

    res.status(201).json({
      success: true,
      message: 'Successfully applied for job',
      application: {
        jobId: job._id,
        userId: req.user._id,
        appliedAt: job.applications[job.applications.length - 1].appliedAt,
        status: 'pending'
      }
    });
  } catch (err) {
    console.error('Apply for job error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while applying for job'
    });
  }
});

module.exports = router;