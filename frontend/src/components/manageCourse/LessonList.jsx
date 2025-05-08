import React, { useState, useEffect } from 'react'
import LessonEditor from './LessonEditor'
import { PlusCircle, BookOpen, MoreVertical, Trash2, Edit2 } from 'lucide-react'

export default function LessonList({ courseId, refreshCourse }) {
  const [lessons, setLessons] = useState([])
  const [editingLesson, setEditingLesson] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleteId, setDeleteId] = useState(null)

  // Fetch lessons from backend
  useEffect(() => {
    if (!courseId) return
    setLoading(true)
    setError('')
    const token = localStorage.getItem('token')
    fetch(`http://localhost:5000/api/course/${courseId}`,
      { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setLessons(data.data?.lessons || []) // FIX: use data.data.lessons
        setLoading(false)
      })
      .catch(() => { setError('Failed to load lessons'); setLoading(false) })
  }, [courseId, showModal, deleteId])

  // Add lesson
  const handleAddLesson = () => {
    setEditingLesson({})
    setShowModal(true)
  }

  // Edit lesson
  const handleEditLesson = (lesson) => {
    // Always get the latest lesson object from the current lessons state (fresh from backend)
    const freshLesson = lessons.find(l => l._id && l._id === lesson._id) || lesson
    setEditingLesson({ ...freshLesson })
    setShowModal(true)
  }

  // Save (add or edit) lesson
  const handleSaveLesson = async (lesson) => {
    setLoading(true)
    setError('')
    const token = localStorage.getItem('token')
    // Only use lesson._id for edit
    const isEdit = Boolean(lesson._id)
    const lessonId = lesson._id
    const url = isEdit
      ? `http://localhost:5000/api/course/${courseId}/lesson/${lessonId}`
      : `http://localhost:5000/api/course/${courseId}/lesson`
    const method = isEdit ? 'PATCH' : 'POST'
    // Ensure every actionStep has a persistent stepId
    const actionSteps = (lesson.actionSteps || []).map((step, idx) => ({
      ...step,
      stepId: step.stepId || `step-${Date.now()}-${idx}`
    }))
    // Send all fields, including actionSteps and youtubeLinks
    const body = JSON.stringify({
      title: lesson.title,
      description: lesson.description,
      open: lesson.open,
      youtubeLinks: lesson.youtubeLinks || [],
      actionSteps,
    })
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body,
      })
      if (!res.ok) throw new Error('Failed to save lesson')
      // Get the saved lesson (with _id/lessonId)
      const savedLesson = isEdit ? lesson : await res.json()
      const realLessonId = isEdit ? lessonId : (savedLesson._id || savedLesson.lessonId)
      // Upload files for each action step if needed
      if (actionSteps && actionSteps.length > 0) {
        for (let i = 0; i < actionSteps.length; i++) {
          const step = actionSteps[i]
          // Only upload if files are File objects (not URLs/strings)
          if (step.files && step.files.length > 0 && step.files.some(f => f instanceof File)) {
            const formData = new FormData()
            step.files.forEach(f => {
              if (f instanceof File) formData.append('files', f)
            })
            const stepId = step.stepId
            const uploadRes = await fetch(`http://localhost:5000/api/course/${courseId}/lesson/${realLessonId}/step/${stepId}/upload`, {
              method: 'POST',
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            })
            if (uploadRes.ok) {
              const data = await uploadRes.json()
              // Update the files array for this step with only valid URLs (strings)
              actionSteps[i].files = Array.isArray(data.files) ? data.files.filter(f => typeof f === 'string') : []
            } else {
              // If upload fails, remove File objects from files array
              actionSteps[i].files = actionSteps[i].files.filter(f => typeof f === 'string')
            }
          } else {
            // If no upload, ensure only string URLs are kept
            actionSteps[i].files = actionSteps[i].files.filter(f => typeof f === 'string')
          }
        }
      }
      setShowModal(false)
      setEditingLesson(null)
      if (refreshCourse) refreshCourse()
    } catch (err) {
      setError('Failed to save lesson')
    }
    setLoading(false)
  }

  // Delete lesson
  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return
    setLoading(true)
    setError('')
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`http://localhost:5000/api/course/${courseId}/lesson/${lessonId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to delete lesson')
      setDeleteId(lessonId)
      if (refreshCourse) refreshCourse()
    } catch {
      setError('Failed to delete lesson')
    }
    setLoading(false)
  }

  return (
    <div className="relative w-full">
      {/* Floating Add Button */}
      <button
        className="absolute right-0 top-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 z-10"
        onClick={handleAddLesson}
      >
        <PlusCircle className="w-5 h-5" />
        <span className="hidden sm:inline">Add Lesson</span>
      </button>
      <div className="pt-14">
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading lessons...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <BookOpen className="w-12 h-12 mb-2 text-indigo-300" />
            <div className="text-lg font-semibold">No lessons yet</div>
            <div className="text-sm">Click "Add Lesson" to create your first lesson.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {lessons.map((lesson, idx) => (
              <div
                key={lesson._id || idx}
                className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-2 border border-gray-200 hover:shadow-lg transition-all duration-200 group relative"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">{lesson.title}</span>
                  {/* Only show edit/delete if _id exists */}
                  {lesson._id && (
                    <>
                      <button className="ml-auto p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-indigo-500" onClick={() => handleEditLesson(lesson)} title="Edit"><Edit2 className="w-4 h-4" /></button>
                      <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500" onClick={() => {
                        const id = lesson._id;
                        if (!id) { console.warn('No _id for lesson', lesson); return; }
                        handleDeleteLesson(id);
                      }} title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
                <div className="text-sm text-gray-600 mb-1">{lesson.description}</div>
                <div className="text-xs font-medium px-2 py-1 rounded bg-indigo-100 text-indigo-700 w-fit mb-2">{lesson.open ? 'Open' : 'Closed'}</div>
                {lesson.youtubeLinks && lesson.youtubeLinks.length > 0 && (
                  <a href={lesson.youtubeLinks[0]} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 underline">YouTube Link</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Modal for LessonEditor */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative animate-fade-in border border-gray-200">
            <LessonEditor
              lesson={{ ...editingLesson, courseId }}
              onClose={() => { setShowModal(false); setEditingLesson(null) }}
              onSave={handleSaveLesson}
            />
          </div>
        </div>
      )}
      {/* Modal animation */}
      <style>{`
        .animate-fade-in { animation: fadeInModal 0.2s cubic-bezier(.4,0,.2,1); }
        @keyframes fadeInModal { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  )
}
