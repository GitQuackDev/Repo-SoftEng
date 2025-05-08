import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import StudentCourseTab from '../../components/manageCourse/StudentCoursetab'

// This page displays the student course tab, which is the dashboard, lesson, and submission.
// It uses StudentCourseTab, StudentDashboard, StudentLessonPage, and StudentSubmission components.
export default function StudentCourse() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch(`http://localhost:5000/api/course/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCourse(data.data))
      .catch(() => setCourse(null))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="p-6 text-base text-slate-500 font-sans">Loading course...</div>
  if (!course) return <div className="p-6 text-base text-red-600 font-sans">Course not found.</div>

  return <StudentCourseTab course={course} />
}