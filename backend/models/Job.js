const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    county: {
      type: String,
      required: true
    },
    town: {
      type: String,
      trim: true
    }
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Internship'],
    required: true
  },
  category: {
    type: String,
    enum: ['Crops', 'Livestock', 'Agribusiness', 'Equipment', 'Research', 'Consulting'],
    required: true
  },
  salary: {
    amount: {
      type: Number
    },
    currency: {
      type: String,
      default: 'KES'
    },
    negotiable: {
      type: Boolean,
      default: false
    }
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  experienceRequired: {
    type: String,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Expert']
  },
  description: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);