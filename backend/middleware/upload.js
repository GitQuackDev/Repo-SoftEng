const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = 'uploads/general/'; // Default path for non-specific uploads
    if (req.baseUrl && req.baseUrl.includes('discussion-forum')) {
      dest = 'uploads/discussion/';
    } else if (req.baseUrl && req.baseUrl.includes('submission')) { // Specific path for submissions
      dest = 'uploads/submissions/';
    } else if (req.baseUrl && req.baseUrl.includes('course') && req.path && req.path.includes('banner')) { // Specific path for course banners
      dest = 'uploads/banners/';
    }
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, ''));
  }
});

const fileFilter = (req, file, cb) => {
  cb(null, true); // Allow all file types
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
