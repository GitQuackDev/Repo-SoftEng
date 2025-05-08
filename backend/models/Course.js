// Course model
const mongoose = require('mongoose')

// Revert: use actionSteps for lesson modules/resources
const LessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  open: { type: Boolean, default: true },
  actionSteps: [{
    stepId: { type: String, required: true },
    title: String,
    description: String,
    resourceUrl: String,
    youtubeLinks: [String],
    files: [String],
  }],
  progress: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    completedSteps: [String], // array of stepId
    lastStepCompletionDate: Date, // NEW: last date a step was completed
    streak: { type: Number, default: 0 }, // NEW: streak of consecutive days
    lessonCompleted: { type: Boolean, default: false } // NEW: explicit lesson completion flag
  }],
  assignment: {
    title: String,
    description: String,
    deadline: Date,
    submissions: [{
      student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      file: String,
      grade: Number,
      feedback: String,
      status: { type: String, enum: ['submitted', 'graded', 'late'], default: 'submitted' },
      submittedAt: Date
    }]
  }
});

const CourseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  details: { type: String },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  banner: { type: String },
  enrolled: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  grades: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    grade: { type: Number },
    status: { type: String, enum: ['pass', 'fail'] }
  }],
  lessons: [LessonSchema],
}, { timestamps: true })

module.exports = mongoose.model('Course', CourseSchema)
