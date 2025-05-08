import React, { useEffect, useState } from 'react'
import { BookOpen } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export default function ProfCourseList() {
  const [courses, setCourses] = useState([])
  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch('http://localhost:5000/api/course/professor', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setCourses(data.data || [])) // <-- FIX: use data.data
  }, [])
  if (!courses.length) return <div className="text-xs text-gray-500 px-4 pb-2">No courses yet.</div>
  return (
    <>
      {courses.map(course => (
        <NavLink key={course._id} to={`/course/${course._id}`} className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isActive ? 'bg-indigo-600/80 text-white' : 'text-gray-700 hover:bg-indigo-100 hover:text-indigo-700'}`}>
          <BookOpen className="w-4 h-4 text-indigo-500" />
          {course.name}
        </NavLink>
      ))}
    </>
  )
}
