const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const auth = require('../middleware/authMiddleware')
const upload = require('../middleware/upload')

router.get('/profile', auth, userController.getProfile)
router.put('/profile', auth, upload.single('avatar'), userController.updateProfile)
router.post('/by-email', userController.getUserByEmail)
router.post('/reset-password', userController.resetPassword)

module.exports = router
