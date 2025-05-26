const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dqnro91sm',
  api_key: '936229583222765',
  api_secret: 'xjbpbFli1RXTH4WYLBFTzaZ9010'
});

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'map-overlays',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 2000, height: 2000, crop: 'limit' },
      { quality: 'auto:good' }
    ],
    resource_type: 'auto',
    format: 'auto'
  }
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB in bytes (Cloudinary free tier limit)
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('image');

// Wrap multer middleware to handle errors
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'File size too large. Maximum allowed size is 10MB (Cloudinary free tier limit).',
          code: err.code
        });
      }
      return res.status(400).json({
        message: err.message,
        code: err.code
      });
    } else if (err) {
      // An unknown error occurred
      console.error('Unknown error:', err);
      return res.status(500).json({
        message: err.message
      });
    }
    // Everything went fine
    next();
  });
};

module.exports = { cloudinary, uploadMiddleware }; 