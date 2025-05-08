const Course = require('../models/Course')
const User = require('../models/User')

exports.createCourse = async (req, res) => {
    try {
        const { name, details } = req.body;
        let bannerPath = null;
        if (req.file) {
            bannerPath = `/uploads/banners/${req.file.filename}`;
        }
        // Use professor from auth middleware
        const professor = req.user.id;
        const course = await Course.create({
            name,
            details,
            professor,
            banner: bannerPath
        });
        return res.status(201).json({
            success: true,
            data: course
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}

exports.getProfessorCourses = async (req, res) => {
    try {
        const courses = await Course.find({ professor: req.user.id });
        return res.status(200).json({
            success: true,
            data: courses
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}

exports.getCourseDetails = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('enrolled')
            .populate('professor', 'name email');
        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            })
        }
        return res.status(200).json({
            success: true,
            data: course
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.enrollStudent = async (req, res) => {
    const { studentId } = req.body

    try {
        const course = await Course.findById(req.params.id)

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            })
        }

        if (course.enrolled.includes(studentId)) {
            return res.status(400).json({
                success: false,
                error: 'Student already enrolled'
            })
        }

        course.enrolled.push(studentId)
        await course.save()

        return res.status(200).json({
            success: true,
            data: course
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.removeStudent = async (req, res) => {
    const { studentId } = req.body

    try {
        const course = await Course.findById(req.params.id)

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            })
        }

        if (!course.enrolled.includes(studentId)) {
            return res.status(400).json({
                success: false,
                error: 'Student not enrolled in this course'
            })
        }

        course.enrolled.pull(studentId)
        await course.save()

        return res.status(200).json({
            success: true,
            data: course
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.updateGrade = async (req, res) => {
    const { studentId, grade } = req.body

    try {
        const course = await Course.findById(req.params.id)

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            })
        }

        // Find the grade object for the student
        let studentGrade = course.grades.find(g => g.student.toString() === studentId)
        if (!studentGrade) {
            // If not found, add new
            course.grades.push({ student: studentId, grade })
        } else {
            studentGrade.grade = grade
        }
        await course.save()

        return res.status(200).json({
            success: true,
            data: course
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.updateCourse = async (req, res) => {
    const { name, code, credits, professor } = req.body

    try {
        const course = await Course.findByIdAndUpdate(req.params.id, {
            name,
            code,
            credits,
            professor
        }, { new: true, runValidators: true })

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            })
        }

        return res.status(200).json({
            success: true,
            data: course
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id)

        if (!course) {
            return res.status(404).json({
                success: false,
                error: 'Course not found'
            })
        }

        return res.status(200).json({
            success: true,
            data: {}
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        })
    }
}

// Get all courses a student is enrolled in
exports.getStudentCourses = async (req, res) => {
    try {
        const courses = await Course.find({ enrolled: req.user.id })
            .populate('professor', 'name email');
        return res.status(200).json({
            success: true,
            data: courses
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}