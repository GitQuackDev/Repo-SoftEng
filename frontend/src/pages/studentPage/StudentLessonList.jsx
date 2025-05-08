import React from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Circle } from 'lucide-react'

export default function StudentLessonList({ course }) {
  const navigate = useNavigate()
  const lessons = (course?.lessons || []).filter(l => l.open)
  // Get userId from JWT
  let userId = null
  try {
    const token = localStorage.getItem('token')
    if (token) userId = JSON.parse(atob(token.split('.')[1])).id
  } catch {}

  if (!lessons.length) return <div className="text-slate-500 p-6 md:p-8 font-sans">No open lessons available.</div>
  return (
    <div className="space-y-6 p-6 md:p-8 font-sans">
      <div className="text-xl font-semibold text-sky-700 mb-4">Lessons</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lessons.map(lesson => {
          const steps = lesson.actionSteps || []
          // Find this student's progress
          let completedStepIds = []
          if (Array.isArray(lesson.progress) && userId) {
            const userProgress = lesson.progress.find(p => p.student && String(p.student) === String(userId))
            if (userProgress && Array.isArray(userProgress.completedSteps)) {
              completedStepIds = userProgress.completedSteps
            }
          }
          const completedCount = completedStepIds.length
          const totalCount = steps.length
          const progress = totalCount ? Math.round((completedCount / totalCount) * 100) : 0
          const isCompleted = totalCount > 0 && completedCount === totalCount
          return (
            <div
              key={lesson._id || lesson.lessonId}
              className={`relative bg-white rounded-xl p-6 shadow-lg border border-slate-200 group hover:shadow-xl hover:border-sky-400 transition-all duration-200 cursor-pointer overflow-hidden`}
              onClick={() => navigate(`/student/course/${course._id}/lesson/${lesson._id}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-lg text-sky-700 group-hover:text-sky-600 transition-colors truncate pr-2">{lesson.title}</span>
                {isCompleted && <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> Completed</span>}
              </div>
              <div className="text-slate-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">{lesson.description}</div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Circle className="w-3.5 h-3.5 text-sky-500" /> {completedCount}/{totalCount} Steps
                </div>
                <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-green-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-xs text-green-600 font-semibold w-10 text-right">{progress}%</span>
              </div>
              {lesson.assignment && (
                <div className="mt-2 text-xs text-amber-600 font-medium">Assignment: {lesson.assignment.title}</div>
              )}
              <div className="absolute right-4 top-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none select-none text-sky-300">
                {isCompleted ? <CheckCircle className="w-14 h-14" /> : <Circle className="w-14 h-14" />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
