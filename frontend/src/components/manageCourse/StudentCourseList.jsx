import React, { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function StudentCourseList() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch('http://localhost:5000/api/course/student', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCourses(data.data || []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false))
  }, [])
  if (loading) return <div className="text-xs text-gray-500 px-4 pb-2">Loading...</div>
  if (!courses.length) return <div className="text-xs text-gray-500 px-4 pb-2">No enrolled classes</div>
  return (
    <>
      {courses.map(course => (
        <button
          key={course._id}
          onClick={() => navigate(`/student/course/${course._id}`)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 w-full text-left"
        >
          <BookOpen className="w-4 h-4 text-indigo-500" />
          {course.name}
        </button>
      ))}
    </>
  )
}
