const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cnnAiController = require('../controllers/cnnAi/cnnAiController');

// Set up multer for memory storage (no need to save to disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Proxy route for image prediction
router.post('/predict', upload.single('file'), cnnAiController.predict);

module.exports = router;
