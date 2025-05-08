const Course = require('../models/Course')
exports.createAssignment = async (req, res) => {
    const { courseId } = req.params
    const { title, description, dueDate } = req.body

    try {
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: 'Course not found' })
        }

        const assignment = {
            title,
            description,
            dueDate,
            course: courseId
        }

        course.assignments.push(assignment)
        await course.save()

        res.status(201).json(assignment)
    } catch (error) {
        res.status(500).json({ message: 'Server error' })
    }
}

exports.getAssignments = async (req, res) => {
    const { courseId } = req.params

    try {
        const course = await Course.findById(courseId).populate('assignments')
        if (!course) {
            return res.status(404).json({ message: 'Course not found' })
        }

        res.json(course.assignments)
    } catch (error) {
        res.status(500).json({ message: 'Server error' })
    }
}

exports.submitAssignment = async (req, res) => {
    const { courseId, assignmentId } = req.params
    const { studentId, submission } = req.body

    try {
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: 'Course not found' })
        }

        const assignment = course.assignments.id(assignmentId)
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' })
        }

        if (!assignment.submissions) {
            assignment.submissions = []
        }

        assignment.submissions.push({ studentId, submission })
        await course.save()

        res.status(201).json({ message: 'Assignment submitted' })
    } catch (error) {
        res.status(500).json({ message: 'Server error' })
    }
}

exports.gradeAssignment = async (req, res) => {
    const { courseId, assignmentId, studentId } = req.params
    const { grade } = req.body

    try {
        const course = await Course.findById(courseId)
        if (!course) {
            return res.status(404).json({ message: 'Course not found' })
        }

        const assignment = course.assignments.id(assignmentId)
        if (!assignment) {
            return res.status(404).json({ message: 'Assignment not found' })
        }

        const submission = assignment.submissions.find(sub => sub.studentId == studentId)
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' })
        }

        submission.grade = grade
        await course.save()

        res.json({ message: 'Grade submitted' })
    } catch (error) {
        res.status(500).json({ message: 'Server error' })
    }
}