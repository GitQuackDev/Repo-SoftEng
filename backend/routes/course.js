const express = require('express')
const router = express.Router()
const courseBaseController = require('../controllers/courseBaseController')
const lessonController = require('../controllers/lessonController')
const assignmentController = require('../controllers/assignmentController')
const moduleController = require('../controllers/moduleController')
const lessonStepController = require('../controllers/lessonStepController')
const auth = require('../middleware/authMiddleware')
const upload = require('../middleware/upload')

// Professor: create course with banner upload
router.post('/professor', auth, upload.single('banner'), courseBaseController.createCourse)
// Professor: get all their courses
router.get('/professor', auth, courseBaseController.getProfessorCourses)
// Student: get all courses the student is enrolled in
router.get('/student', auth, courseBaseController.getStudentCourses)
// GET course details, enrolled students, grades
router.get('/:id', auth, courseBaseController.getCourseDetails)
// Enroll a student
router.post('/:id/enroll', auth, courseBaseController.enrollStudent)
// Remove a student
router.delete('/:id/enroll/:studentId', auth, courseBaseController.removeStudent)
// Update a student's grade/status
router.patch('/:id/grade', auth, courseBaseController.updateGrade)

// --- Assignment & Quiz Endpoints ---
// Professor: create assignment/quiz
router.post('/:id/assignment', auth, assignmentController.createAssignment)
// Student: submit assignment/quiz (file upload)
router.post('/:id/assignment/:assignmentId/submit', auth, upload.single('file'), assignmentController.submitAssignment)
// Get all assignments/quizzes for a course
router.get('/:id/assignments', auth, assignmentController.getAssignments)
// Professor: grade assignment/quiz
router.patch('/:id/assignment/:assignmentId/grade', auth, assignmentController.gradeAssignment)

// --- Module Progress Endpoints ---
// Get modules and student progress
router.get('/:id/modules', auth, moduleController.getModulesAndProgress)
// Mark module as complete
router.post('/:id/module/:moduleId/complete', auth, moduleController.completeModule)

// --- Lesson Endpoints ---
// Professor: create lesson
router.post('/:id/lesson', auth, lessonController.createLesson)
// Professor: update lesson
router.patch('/:id/lesson/:lessonId', auth, lessonController.updateLesson)
// Professor: delete lesson
router.delete('/:id/lesson/:lessonId', auth, lessonController.deleteLesson)
// Upload files to lesson
router.post('/:id/lesson/:lessonId/upload', auth, upload.array('files'), lessonController.uploadLessonFiles)
// Add or update assignment/quiz in lesson
router.post('/:id/lesson/:lessonId/assignment', auth, lessonController.addOrUpdateLessonAssignment)
// Delete assignment/quiz from lesson
router.delete('/:id/lesson/:lessonId/assignment', auth, lessonController.deleteLessonAssignment)
// PATCH: update a course (professor only)
router.patch('/:id', auth, upload.single('banner'), courseBaseController.updateCourse)
// DELETE: delete a course (professor only)
router.delete('/:id', auth, courseBaseController.deleteCourse)

// --- Lesson Step Progress ---
router.patch('/:id/lesson/:lessonId/step/:stepId/complete', auth, lessonStepController.completeLessonStep)
router.patch('/:id/lesson/:lessonId/step/:stepId/incomplete', auth, lessonStepController.incompleteLessonStep)

// --- Lesson Module Upload Endpoint ---
// Upload files to a specific module in a lesson
router.post('/:id/lesson/:lessonId/module/:moduleId/upload', auth, upload.array('files', 10), lessonController.uploadModuleFiles)
// Upload files to a specific step (actionStep) in a lesson
router.post('/:id/lesson/:lessonId/step/:stepId/upload', auth, upload.array('files', 10), lessonController.uploadStepFiles)

// Get a single lesson by courseId and lessonId
router.get('/:courseId/lesson/:lessonId', auth, async (req, res) => {
  try {
    const course = await require('../models/Course').findById(req.params.courseId)
    if (!course) return res.status(404).json({ success: false, error: 'Course not found' })
    const lesson = course.lessons.id(req.params.lessonId)
    if (!lesson) return res.status(404).json({ success: false, error: 'Lesson not found' })
    // Convert student ObjectId to string for all progress entries
    const lessonObj = lesson.toObject()
    if (Array.isArray(lessonObj.progress)) {
      lessonObj.progress = lessonObj.progress.map(p => ({
        ...p,
        student: p.student ? p.student.toString() : p.student
      }))
    }
    res.status(200).json({ success: true, data: lessonObj })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// --- Student Lesson Progress ---
const studentLessonController = require('../controllers/studentLessonController');
router.post('/:courseId/lesson/:lessonId/progress', auth, studentLessonController.saveLessonProgress);

module.exports = router
