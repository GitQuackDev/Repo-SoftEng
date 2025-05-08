const Course = require('../models/Course')
exports.completeLessonStep = async (req, res) => {
    const { courseId, lessonId, stepId } = req.body
    try {
        await Course.findOneAndUpdate(
            { _id: courseId, 'modules.lessons._id': lessonId, 'modules.lessons.steps._id': stepId },
            { $set: { 'modules.$[].lessons.$[].steps.$[elem].completed': true } },
            { arrayFilters: [{ 'elem._id': stepId }] }
        )
        res.sendStatus(204)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}

exports.incompleteLessonStep = async (req, res) => {
    const { courseId, lessonId, stepId } = req.body
    try {
        await Course.findOneAndUpdate(
            { _id: courseId, 'modules.lessons._id': lessonId, 'modules.lessons.steps._id': stepId },
            { $set: { 'modules.$[].lessons.$[].steps.$[elem].completed': false } },
            { arrayFilters: [{ 'elem._id': stepId }] }
        )
        res.sendStatus(204)
    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }
}