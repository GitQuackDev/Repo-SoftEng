require('dotenv').config()
const express = require('express')
const connectDB = require('./config/db')
const cors = require('cors')
const fs = require('fs');
const uploadDir = 'uploads/banners/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const app = express()

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

// Connect to MongoDB
connectDB()

// Routes
app.get('/', (req, res) => res.send('API Running'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/course', require('./routes/course'))
app.use('/uploads', express.static('uploads'))
app.use('/api/user', require('./routes/user'))
app.use('/api/cnn-ai', require('./routes/cnnAi'))
app.use('/api/discussion-forum', require('./routes/discussionForumRoutes/DiscussionForum'))
app.use('/api/submission', require('./routes/submission'))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))


const multer = require('multer');
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || (err && err.message && err.message.includes('Multer'))) {
    return res.status(400).json({ msg: 'Multer error', error: err.message });
  }
  if (err) {
    return res.status(500).json({ msg: 'Server error', error: err.message });
  }
  next();
});
