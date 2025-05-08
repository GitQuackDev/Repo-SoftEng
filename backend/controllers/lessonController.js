const Course = require('../models/Course')
exports.createLesson = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        if (!course) {
            return res.status(404).send('Course not found')
        }
        // Use actionSteps for lesson steps/modules/resources
        const actionSteps = (req.body.actionSteps || []).map(step => ({
            stepId: step.stepId,
            title: step.title,
            description: step.description,
            resourceUrl: step.resourceUrl,
            youtubeLinks: Array.isArray(step.youtubeLinks) ? step.youtubeLinks.filter(l => typeof l === 'string') : [],
            files: Array.isArray(step.files) ? step.files.filter(f => typeof f === 'string') : [],
        }))
        const lesson = {
            title: req.body.title,
            description: req.body.description,
            open: req.body.open ?? true,
            actionSteps,
        }
        course.lessons.push(lesson)
        await course.save()
        res.status(201).send(lesson)
    } catch (error) {
        res.status(500).send(error)
    }
}
exports.updateLesson = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        if (!course) {
            return res.status(404).send('Course not found')
        }
        const lesson = course.lessons.id(req.params.lessonId)
        if (!lesson) {
            return res.status(404).send('Lesson not found')
        }
        lesson.title = req.body.title
        lesson.description = req.body.description
        lesson.open = req.body.open ?? lesson.open
        // Save actionSteps (steps/modules/resources)
        lesson.actionSteps = (req.body.actionSteps || []).map(step => ({
            stepId: step.stepId,
            title: step.title,
            description: step.description,
            resourceUrl: step.resourceUrl,
            youtubeLinks: Array.isArray(step.youtubeLinks) ? step.youtubeLinks.filter(l => typeof l === 'string') : [],
            files: Array.isArray(step.files) ? step.files.filter(f => typeof f === 'string') : [],
        }))
        await course.save()
        res.send(lesson)
    } catch (error) {
        res.status(500).send(error)
    }
}
exports.deleteLesson = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        if (!course) {
            return res.status(404).send('Course not found')
        }
        const lesson = course.lessons.id(req.params.lessonId)
        if (!lesson) {
            return res.status(404).send('Lesson not found')
        }
        // Fix assignment delete logic
        if (lesson.assignment) lesson.assignment = undefined
        if (typeof lesson.remove === 'function') {
            lesson.remove()
        } else {
            // fallback: filter out lesson
            course.lessons = course.lessons.filter(l => l._id.toString() !== req.params.lessonId)
        }
        await course.save()
        res.send(lesson)
    } catch (error) {
        console.error('Delete lesson error:', error)
        res.status(500).send(error?.message || 'Server error')
    }
}
exports.uploadLessonFiles = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        if (!course) {
            return res.status(404).send('Course not found')
        }
        const lesson = course.lessons.id(req.params.lessonId)
        if (!lesson) {
            return res.status(404).send('Lesson not found')
        }
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.')
        }
        // handle file upload
        res.send('Files uploaded!')
    } catch (error) {
        res.status(500).send(error)
    }
}
exports.addOrUpdateLessonAssignment = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        if (!course) {
            return res.status(404).send('Course not found')
        }
        const lesson = course.lessons.id(req.params.lessonId)
        if (!lesson) {
            return res.status(404).send('Lesson not found')
        }
        lesson.assignment = req.body.assignment
        await course.save()
        res.send(lesson)
    } catch (error) {
        res.status(500).send(error)
    }
}
exports.deleteLessonAssignment = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
        if (!course) {
            return res.status(404).send('Course not found')
        }
        const lesson = course.lessons.id(req.params.lessonId)
        if (!lesson) {
            return res.status(404).send('Lesson not found')
        }
        // Fix: remove assignment safely
        lesson.assignment = undefined
        await course.save()
        res.send(lesson)
    } catch (error) {
        res.status(500).send(error)
    }
}
exports.uploadStepFiles = async (req, res) => {
  try {
    const { id, lessonId, stepId } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ msg: 'Course not found', id });
    const lesson = course.lessons.id(lessonId);
    if (!lesson) {
      return res.status(404).json({
        msg: 'Lesson not found',
        lessonId,
        lessons: course.lessons.map(l => l._id && l._id.toString())
      });
    }
    const step = lesson.actionSteps.find(s => s.stepId === stepId);
    if (!step) {
      return res.status(404).json({
        msg: 'Step not found',
        stepId,
        actionSteps: lesson.actionSteps.map(s => s.stepId)
      });
    }
    if (req.files && req.files.length > 0) {
      step.files = req.files.slice(0, 10).map(file => `/uploads/banners/${file.filename}`);
    }
    await course.save();
    res.json({ msg: 'Files uploaded', files: Array.isArray(step.files) ? step.files.filter(f => typeof f === 'string') : [] });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};
exports.uploadModuleFiles = async (req, res) => {
  try {
    const { id, lessonId, moduleId } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ msg: 'Course not found', id });
    const lesson = course.lessons.id(lessonId);
    if (!lesson) return res.status(404).json({ msg: 'Lesson not found', lessonId });
    const module = lesson.modules.find(m => m.moduleId === moduleId);
    if (!module) return res.status(404).json({ msg: 'Module not found', moduleId });
    if (req.files && req.files.length > 0) {
      module.files = req.files.slice(0, 10).map(file => `/uploads/banners/${file.filename}`);
    }
    await course.save();
    res.json({ msg: 'Files uploaded', files: Array.isArray(module.files) ? module.files.filter(f => typeof f === 'string') : [] });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};