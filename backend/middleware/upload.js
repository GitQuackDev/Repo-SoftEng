const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Save forum uploads in uploads/discussion, others in uploads/banners
    let dest = 'uploads/banners/';
    if (req.baseUrl && req.baseUrl.includes('discussion-forum')) {
      dest = 'uploads/discussion/';
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
