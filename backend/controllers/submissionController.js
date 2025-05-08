const Submission = require('../models/submission')

// Create a new submission item (assignment, quiz, etc)
exports.createSubmission = async (req, res) => {
  try {
    const { course, title, type, dueDate } = req.body
    const submission = new Submission({ course, title, type, dueDate })
    await submission.save()
    res.status(201).json(submission)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Get all submission items for a course
exports.getSubmissionsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params
    const submissions = await Submission.find({ course: courseId }).populate('submissions.student', 'name email')
    res.json(submissions)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Update a submission item (edit, close, hide, etc)
exports.updateSubmission = async (req, res) => {
  try {
    const { id } = req.params
    const update = req.body
    const submission = await Submission.findByIdAndUpdate(id, update, { new: true })
    res.json(submission)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Delete a submission item
exports.deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params
    await Submission.findByIdAndDelete(id)
    res.json({ message: 'Submission deleted' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Add or update a student's submission (file upload, grade, feedback)
exports.gradeStudentSubmission = async (req, res) => {
  try {
    const { id, studentId } = req.params
    const { grade, feedback } = req.body
    const submission = await Submission.findById(id)
    if (!submission) return res.status(404).json({ error: 'Submission not found' })
    const studentSub = submission.submissions.find(s => s.student.toString() === studentId)
    if (!studentSub) return res.status(404).json({ error: 'Student submission not found' })
    studentSub.grade = grade
    studentSub.feedback = feedback
    await submission.save()
    res.json(studentSub)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
}

// Get all submissions for a student in a course
exports.getStudentSubmissions = async (req, res) => {
  try {
    const { courseId } = req.params
    const userId = req.user.id
    // Find all submission items for this course
    const submissions = await Submission.find({ course: courseId })
    // For each, filter only this student's submissions
    const studentSubs = submissions.map(sub => {
      const mySubs = (sub.submissions || []).filter(s => s.student && s.student.toString() === userId)
      return mySubs.map(s => ({
        ...s.toObject(),
        title: sub.title,
        type: sub.type,
        dueDate: sub.dueDate,
        fileUrl: s.fileUrl
      }))
    }).flat()
    res.json(studentSubs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Student submits or updates their work for an assignment/quiz
exports.submitStudentWork = async (req, res) => {
  try {
    const { id } = req.params // assignment id
    const userId = req.user.id
    const fileUrl = req.file ? `/uploads/banners/${req.file.filename}` : req.body.fileUrl
    const submission = await Submission.findById(id)
    if (!submission) return res.status(404).json({ error: 'Assignment not found' })
    let studentSub = submission.submissions.find(s => s.student.toString() === userId)
    if (studentSub) {
      studentSub.fileUrl = fileUrl
      studentSub.status = 'Submitted'
      studentSub.submittedAt = new Date()
    } else {
      submission.submissions.push({
        student: userId,
        fileUrl,
        status: 'Submitted',
        submittedAt: new Date()
      })
    }
    await submission.save()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Student unsubmit (remove their submission if not late/closed)
exports.unsubmitStudentWork = async (req, res) => {
  try {
    const { id } = req.params // assignment id
    const userId = req.user.id
    const submission = await Submission.findById(id)
    if (!submission) return res.status(404).json({ error: 'Assignment not found' })
    // Check if closed
    if (submission.status === 'Closed') return res.status(403).json({ error: 'Assignment is closed' })
    // Check if late
    const now = new Date()
    if (submission.dueDate && now > submission.dueDate) return res.status(403).json({ error: 'Assignment is late' })
    // Remove student's submission
    submission.submissions = (submission.submissions || []).filter(s => String(s.student) !== String(userId))
    await submission.save()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}