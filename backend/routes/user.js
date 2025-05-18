const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const auth = require('../middleware/authMiddleware')
const upload = require('../middleware/upload')

// Middleware to check admin
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next()
  return res.status(403).json({ msg: 'Admin only' })
}

router.get('/profile', auth, userController.getProfile)
router.put('/profile', auth, upload.single('avatar'), userController.updateProfile)
router.post('/by-email', userController.getUserByEmail)
router.post('/reset-password', userController.resetPassword)

// Admin user management routes
router.get('/', auth, isAdmin, userController.getAllUsers)
router.put('/:id', auth, isAdmin, userController.updateUser)
router.delete('/:id', auth, isAdmin, userController.deleteUser)
router.post('/', auth, isAdmin, userController.addUser)

module.exports = router
