const express = require('express');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// @route   POST api/jobs
// @desc    Post a new job
// @access  Private
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      title,
      companyName,
      location,
      jobType,
      category,
      salary,
      requiredSkills,
      experienceRequired,
      description,
      deadline
    } = req.body;

    // Validate required fields
    if (!title || !companyName || !location || !jobType || !category || !description || !deadline) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    const newJob = new Job({
      employerId: req.userId,
      title,
      companyName,
      location,
      jobType,
      category,
      salary,
      requiredSkills,
      experienceRequired,
      description,
      deadline
    });

    const job = await newJob.save();
    
    // Populate employer data
    const populatedJob = await Job.findById(job._id)
      .populate('employerId', 'username firstName lastName profilePicture farmName location verified');

    res.json(populatedJob);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/jobs
// @desc    Get all jobs with pagination and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    // Apply filters
    if (req.query.location) {
      query['location.county'] = { $regex: req.query.location, $options: 'i' };
    }

    if (req.query.type) {
      query.jobType = req.query.type;
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    if (req.query.experience) {
      query.experienceRequired = req.query.experience;
    }

    if (req.query.minSalary || req.query.maxSalary) {
      query['salary.amount'] = {};
      if (req.query.minSalary) query['salary.amount'].$gte = parseFloat(req.query.minSalary);
      if (req.query.maxSalary) query['salary.amount'].$lte = parseFloat(req.query.maxSalary);
    }

    const jobs = await Job.find(query)
      .populate('employerId', 'username firstName lastName profilePicture farmName location verified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalJobs: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/jobs/:id
// @desc    Get job by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('employerId', 'username firstName lastName profilePicture farmName location verified');

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    if (!job.isActive) {
      return res.status(404).json({ msg: 'Job is no longer active' });
    }

    res.json(job);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/jobs/:id
// @desc    Update a job
// @access  Private (Employer only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check if user owns the job
    if (job.employerId.toString() !== req.userId) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Update job fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'employerId') { // Prevent changing the employer
        job[key] = req.body[key];
      }
    });

    await job.save();

    // Populate employer data
    const updatedJob = await Job.findById(job._id)
      .populate('employerId', 'username firstName lastName profilePicture farmName location verified');

    res.json(updatedJob);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/jobs/:id
// @desc    Delete a job
// @access  Private (Employer only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    // Check if user owns the job
    if (job.employerId.toString() !== req.userId) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Job.findByIdAndRemove(req.params.id);

    res.json({ msg: 'Job removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/jobs/:id/apply
// @desc    Apply to a job
// @access  Private (Applicant only)
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const { message, cvUrl } = req.body;
    const jobId = req.params.id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    if (!job.isActive) {
      return res.status(400).json({ msg: 'Job is no longer accepting applications' });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      jobId: jobId,
      applicantId: req.userId
    });

    if (existingApplication) {
      return res.status(400).json({ msg: 'You have already applied to this job' });
    }

    // Create new application
    const newApplication = new Application({
      jobId: jobId,
      applicantId: req.userId,
      message: message || '',
      cvUrl: cvUrl || ''
    });

    const application = await newApplication.save();

    // Add application to job's applications array
    job.applications.push(application._id);
    await job.save();

    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/jobs/search
// @desc    Search jobs by keyword
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, location, type, category, experience, minSalary, maxSalary, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let query = { isActive: true };
    
    // Add search query
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { 'location.county': { $regex: q, $options: 'i' } },
        { companyName: { $regex: q, $options: 'i' } },
        { requiredSkills: { $in: [new RegExp(q, 'i')] } }
      ];
    }
    
    // Add filters
    if (location) {
      query['location.county'] = { $regex: location, $options: 'i' };
    }
    
    if (type) {
      query.jobType = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (experience) {
      query.experienceRequired = experience;
    }
    
    if (minSalary || maxSalary) {
      query['salary.amount'] = {};
      if (minSalary) query['salary.amount'].$gte = parseFloat(minSalary);
      if (maxSalary) query['salary.amount'].$lte = parseFloat(maxSalary);
    }
    
    const jobs = await Job.find(query)
      .populate('employerId', 'username firstName lastName profilePicture farmName location verified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Job.countDocuments(query);
    
    res.json({
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalJobs: total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/jobs/employer/:employerId
// @desc    Get jobs by employer ID
// @access  Public
router.get('/employer/:employerId', async (req, res) => {
  try {
    const jobs = await Job.find({ 
      employerId: req.params.employerId,
      isActive: true
    })
      .populate('employerId', 'username firstName lastName profilePicture farmName location verified')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/jobs/applications/:jobId
// @desc    Get applications for a job (Employer only)
// @access  Private
router.get('/applications/:jobId', authenticateToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }
    
    // Check if user owns the job
    if (job.employerId.toString() !== req.userId) {
      return res.status(401).json({ msg: 'User not authorized' });
    }
    
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('applicantId', 'username firstName lastName profilePicture farmName location verified')
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/jobs/dashboard/stats
// @desc    Get job-related dashboard stats
// @access  Private
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    // Get stats for the authenticated user
    const userId = req.userId;
    
    // Count jobs applied by user
    const jobsApplied = await Application.countDocuments({ applicantId: userId });
    
    // Count jobs posted by user (as employer)
    const jobsPosted = await Job.countDocuments({ employerId: userId });
    
    // Count total applications received for jobs posted by user
    const totalApplications = await Application.countDocuments({
      jobId: { $in: (await Job.find({ employerId: userId })).map(job => job._id) }
    });
    
    // Count pending applications for jobs posted by user
    const pendingApplications = await Application.countDocuments({
      jobId: { $in: (await Job.find({ employerId: userId })).map(job => job._id) },
      status: 'pending'
    });
    
    // Count accepted applications for jobs posted by user
    const acceptedApplications = await Application.countDocuments({
      jobId: { $in: (await Job.find({ employerId: userId })).map(job => job._id) },
      status: 'accepted'
    });
    
    res.json({
      jobsApplied,
      jobsPosted,
      totalApplications,
      pendingApplications,
      acceptedApplications
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/jobs/applications/user
// @desc    Get applications made by user (Applicant only)
// @access  Private
router.get('/applications/user', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({ applicantId: req.userId })
      .populate('jobId', 'title companyName location jobType category salary deadline')
      .sort({ appliedAt: -1 });
    
    res.json(applications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;