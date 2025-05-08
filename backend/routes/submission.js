const express = require('express')
const router = express.Router()
const submissionController = require('../controllers/submissionController')
const auth = require('../middleware/authMiddleware')
const upload = require('../middleware/upload')

// Professor: CRUD for submission items
router.post('/', submissionController.createSubmission)
router.get('/course/:courseId', submissionController.getSubmissionsByCourse)
router.put('/:id', submissionController.updateSubmission)
router.delete('/:id', submissionController.deleteSubmission)

// Professor: Grade a student's submission
router.put('/:id/grade/:studentId', submissionController.gradeStudentSubmission)

// Get all submissions for a student in a course
router.get('/course/:courseId/student', auth, submissionController.getStudentSubmissions)

// Student submits or updates their work for an assignment/quiz (file upload supported)
router.post('/:id/submit', auth, upload.single('file'), submissionController.submitStudentWork)
// Student unsubmit (remove their submission if not late/closed)
router.post('/:id/unsubmit', auth, submissionController.unsubmitStudentWork)

module.exports = router