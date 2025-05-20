import React from 'react'

const API = import.meta.env.VITE_API_URL || '';

export default function CourseHeader({ course }) {
  if (!course) return null
  return (
    <div className="flex flex-col md:flex-row gap-6 mb-8 bg-white rounded-2xl shadow-lg p-6">
      {course.banner && <img src={`${API}${course.banner}`} alt={course.name} className="w-full md:w-64 h-40 object-cover rounded-2xl border border-gray-200" />}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold text-indigo-700 mb-2">{course.name}</h1>
          <p className="text-gray-600 mb-2">{course.details}</p>
          <div className="text-xs text-gray-500 mb-2">Created: {new Date(course.createdAt).toLocaleString()}</div>
          <div className="text-xs text-gray-500 mb-2">Professor: {course.professor?.name} ({course.professor?.email})</div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <div className="bg-indigo-100 text-indigo-700 rounded-xl px-4 py-2 text-sm font-semibold">Enrolled: {course.enrolled?.length || 0}</div>
        </div>
      </div>
    </div>
  )
}