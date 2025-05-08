const Course = require('../models/Course');
const mongoose = require('mongoose');

// Save or update student's completed steps for a lesson
exports.saveLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id; // always use id from authMiddleware
    const { completedSteps } = req.body; // array of stepId

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const lesson = course.lessons.id(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    // Defensive: ensure lesson.progress is an array
    if (!Array.isArray(lesson.progress)) lesson.progress = [];
    // Remove any progress entries without a valid student field (data cleanup)
    lesson.progress = lesson.progress.filter(
      p => p && p.student && String(p.student) !== 'undefined' && String(p.student) !== ''
    );
    // Find or create progress entry for this student (skip malformed entries)
    let progress = lesson.progress.find(
      p => p && p.student && p.student.toString() === userId
    );
    const today = new Date();
    today.setHours(0,0,0,0);
    if (!progress) {
      lesson.progress.push({
        student: mongoose.Types.ObjectId(userId),
        completedSteps,
        lastStepCompletionDate: completedSteps.length > 0 ? today : null,
        streak: completedSteps.length > 0 ? 1 : 0
      });
    } else {
      // Only update streak if a new step is completed
      const prevCount = Array.isArray(progress.completedSteps) ? progress.completedSteps.length : 0;
      progress.completedSteps = completedSteps;
      if (completedSteps.length > prevCount) {
        // Check if last completion was yesterday or today
        let last = progress.lastStepCompletionDate ? new Date(progress.lastStepCompletionDate) : null;
        if (last) last.setHours(0,0,0,0);
        if (last && (today - last === 86400000)) {
          progress.streak = (progress.streak || 0) + 1;
        } else if (last && (today - last === 0)) {
          // Same day, keep streak
        } else {
          progress.streak = 1;
        }
        progress.lastStepCompletionDate = today;
      }
    }
    await course.save();
    res.json({ message: 'Progress saved', completedSteps });
  } catch (err) {
    console.error('SaveLessonProgress error:', {
      error: err,
      courseId: req?.params?.courseId,
      lessonId: req?.params?.lessonId,
      userId: req?.user?._id,
      completedSteps: req?.body?.completedSteps,
      lessonProgress: typeof lesson !== 'undefined' ? lesson.progress : undefined
    });
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark lesson as completed for a student
exports.markLessonCompleted = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const lesson = course.lessons.id(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    if (!Array.isArray(lesson.progress)) lesson.progress = [];
    let progress = lesson.progress.find(
      p => p && p.student && p.student.toString() === userId
    );
    if (!progress) {
      progress = { student: mongoose.Types.ObjectId(userId), completedSteps: [], lessonCompleted: true };
      lesson.progress.push(progress);
    } else {
      progress.lessonCompleted = true;
    }
    await course.save();
    res.json({ message: 'Lesson marked as completed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
