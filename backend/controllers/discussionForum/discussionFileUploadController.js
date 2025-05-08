const path = require('path');
const fs = require('fs');

// Handles file upload for discussion/comment sections
exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Return file URL and type
  const fileUrl = `/uploads/discussion/${req.file.filename}`;
  const fileType = path.extname(req.file.originalname).toLowerCase();
  res.json({ fileUrl, fileType });
};
