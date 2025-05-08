import React, { useState } from 'react'
import StudentDashboard from '../../pages/studentPage/StudentDashboard'
import StudentLessonList from '../../pages/studentPage/StudentLessonList'
import StudentSubmission from '../../pages/studentPage/StudentSubmission'

export default function StudentCoursetab({ course }) {
  const [tab, setTab] = useState('dashboard')
  return (
    <div className="space-y-6"> {/* Adjusted spacing */}
      <div className="flex gap-3 border-b border-gray-200 pb-px"> {/* Modernized tab bar */}
        <button 
          className={`px-5 py-2.5 rounded-t-lg font-medium text-sm transition-colors duration-150 ease-in-out focus:outline-none 
            ${tab === 'dashboard' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`} 
          onClick={() => setTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`px-5 py-2.5 rounded-t-lg font-medium text-sm transition-colors duration-150 ease-in-out focus:outline-none 
            ${tab === 'lessons' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`} 
          onClick={() => setTab('lessons')}
        >
          Lessons
        </button>
        <button 
          className={`px-5 py-2.5 rounded-t-lg font-medium text-sm transition-colors duration-150 ease-in-out focus:outline-none 
            ${tab === 'submission' 
              ? 'bg-indigo-600 text-white shadow-md' 
              : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
            }`} 
          onClick={() => setTab('submission')}
        >
          Submission
        </button>
      </div>
      <div className="p-1"> {/* Added slight padding for content area */}
        {tab === 'dashboard' && <StudentDashboard course={course} />}
        {tab === 'lessons' && <StudentLessonList course={course} />}
        {tab === 'submission' && <StudentSubmission course={course} />}
      </div>
    </div>
  )
}