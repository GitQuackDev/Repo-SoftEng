const express = require('express')
const router = express.Router()
const submissionController = require('../controllers/submissionController')
const auth = require('../middleware/authMiddleware')
const upload = require('../middleware/upload')

// Professor: CRUD for submission items
router.post('/', auth, submissionController.createSubmission) // Added auth
router.get('/course/:courseId', auth, submissionController.getSubmissionsByCourse) // Added auth
router.get('/:id', auth, submissionController.getSubmissionById) // New route to get a single submission by ID
router.put('/:id', auth, submissionController.updateSubmission) // Added auth
router.delete('/:id', auth, submissionController.deleteSubmission) // Added auth

// Professor: Grade a student's submission
router.put('/:id/grade/:studentId', auth, submissionController.gradeStudentSubmission) // Added auth

// Get all submissions for a student in a course
router.get('/course/:courseId/student', auth, submissionController.getStudentSubmissions)

// Student submits or updates their work for an assignment/quiz (file upload supported)
router.post('/:id/submit', auth, upload.single('file'), submissionController.submitStudentWork)
// Student unsubmit (remove their submission if not late/closed)
router.post('/:id/unsubmit', auth, submissionController.unsubmitStudentWork)

module.exports = router