const mongoose = require('mongoose')

const SubmissionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ['Assignment', 'Quiz', 'Project', 'Exam'], required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  visible: { type: Boolean, default: true },
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fileUrl: String,
    status: { type: String, enum: ['Submitted', 'Not Submitted'], default: 'Not Submitted' },
    grade: Number,
    feedback: String,
    submittedAt: Date
  }]
}, { timestamps: true })

module.exports = mongoose.model('Submission', SubmissionSchema)