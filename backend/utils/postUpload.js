const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure storage for post media
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create upload directory if it doesn't exist
    const uploadDir = 'uploads/posts/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow only specific file types for posts
const fileFilter = (req, file, cb) => {
  // Accept images and videos for posts
  if (file.mimetype.startsWith('image/') || 
      file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed for posts.'), false);
  }
};

// Configure multer for post uploads
const postUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for posts
    files: 5 // Allow up to 5 files per post
  },
  fileFilter: fileFilter
});

module.exports = postUpload;