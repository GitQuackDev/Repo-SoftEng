const Course = require('../models/Course')
exports.getModulesAndProgress = async (req, res) => {
    try {
        const courseId = req.params.id
        const course = await Course.findById(courseId).populate('modules')
        if (!course) {
            return res.status(404).json({ message: 'Course not found' })
        }
        const totalModules = course.modules.length
        const completedModules = course.modules.filter(module => module.completed).length
        const progress = (completedModules / totalModules) * 100
        res.status(200).json({ progress, totalModules, completedModules })
    } catch (error) {
        console.error('Error getting modules and progress:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}
exports.completeModule = async (req, res) => {
    try {
        const { moduleId } = req.body
        const course = await Course.findOneAndUpdate(
            { 'modules._id': moduleId },
            { $set: { 'modules.$.completed': true } },
            { new: true }
        )
        if (!course) {
            return res.status(404).json({ message: 'Module not found' })
        }
        res.status(200).json({ message: 'Module completed' })
    } catch (error) {
        console.error('Error completing module:', error)
        res.status(500).json({ message: 'Internal server error' })
    }
}